export type ClassInfo = {
  className: string;
  methods: string[];
  properties: string[];
  // メソッドからアクセスしているプロパティやメソッドのリスト
  references: Map<string, string[]>;
};
