export type ParsedArgs =
  | { targetDir: string; error?: undefined }
  | { targetDir?: undefined; error: string };

export function parseArgs(args: string[]): ParsedArgs {
  if (args.length === 0) {
    return { error: "対象ディレクトリを指定してください。\n使い方: soame <対象ディレクトリ>" };
  }
  return { targetDir: args[0] };
}
