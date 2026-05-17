import type { ClassInfo } from "../classInfo";

/**
 * 外部ライブラリに依存せず、正規表現とブロック解析でKotlinソースを解析します。
 * クラス内のメソッド、プロパティ、およびメソッド内からの参照を抽出します。
 */
export function parseKotlinClass(content: string): ClassInfo[] {
  const classes: ClassInfo[] = [];

  // クラス定義を検索 (簡易的な実装。ネストしたクラスは最初の1レベルを対象とする)
  // class ClassName { ... }
  const classRegex = /class\s+([a-zA-Z0-9_]+)\s*(?:\([^)]*\))?\s*(?::\s*[^{]+)?\s*\{/g;
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1];
    const startIndex = match.index + match[0].length;
    const classBody = extractBlock(content, startIndex - 1);

    if (classBody) {
      classes.push(analyzeClassBody(className, classBody));
    }
  }

  return classes;
}

/**
 * { } の対応を数えてブロックの中身を取り出す
 */
function extractBlock(content: string, openBraceIndex: number): string | null {
  let braceCount = 0;
  let started = false;

  for (let i = openBraceIndex; i < content.length; i++) {
    if (content[i] === "{") {
      braceCount++;
      started = true;
    } else if (content[i] === "}") {
      braceCount--;
    }

    if (started && braceCount === 0) {
      return content.substring(openBraceIndex + 1, i);
    }
  }
  return null;
}

/**
 * クラスのボディ内を解析してメソッド、プロパティ、参照を抽出する
 */
function analyzeClassBody(className: string, body: string): ClassInfo {
  const methods: string[] = [];
  const properties: string[] = [];
  const references = new Map<string, string[]>();

  // 1. プロパティの抽出: val/var name
  const propRegex = /(?:val|var)\s+([a-zA-Z0-9_]+)/g;
  let propMatch;
  while ((propMatch = propRegex.exec(body)) !== null) {
    properties.push(propMatch[1]);
  }

  // 2. メソッドの抽出と解析: fun name(...) { ... }
  const funcRegex = /fun\s+([a-zA-Z0-9_]+)\s*\([^)]*\)[^{]*\{/g;
  let funcMatch;
  while ((funcMatch = funcRegex.exec(body)) !== null) {
    const methodName = funcMatch[1];
    methods.push(methodName);

    const funcStartIndex = funcMatch.index + funcMatch[0].length;
    const funcBody = extractBlock(body, funcStartIndex - 1);

    if (funcBody) {
      // メソッドボディ内での他メンバへの参照を検索
      // ここでは簡易的に、単語の出現をチェックする
      const refs: string[] = [];
      // 識別子と思われる単語を抽出
      const wordRegex = /\b([a-zA-Z0-9_]+)\b/g;
      let wordMatch;
      while ((wordMatch = wordRegex.exec(funcBody)) !== null) {
        const word = wordMatch[1];
        // 既知のプロパティまたはメソッドであれば参照として記録
        if (word !== methodName && (properties.includes(word) || methods.includes(word))) {
          refs.push(word);
        }
      }
      references.set(methodName, Array.from(new Set(refs)));
    }
  }

  return { className, methods, properties, references };
}
