export type ParsedArgs =
  | { targetDir: string; showGraph: boolean; error?: undefined }
  | { targetDir?: undefined; showGraph?: undefined; error: string };

export function parseArgs(args: string[]): ParsedArgs {
  const flags = args.filter((a) => a.startsWith("-"));
  const positional = args.filter((a) => !a.startsWith("-"));

  if (positional.length === 0) {
    return { error: "対象ディレクトリを指定してください。\n使い方: soame <対象ディレクトリ> [-g]" };
  }

  const showGraph = flags.includes("-g");
  return { targetDir: positional[0], showGraph };
}
