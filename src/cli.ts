export type ParsedArgs =
  | { targetDir: string; showGraph: boolean; showAcd: boolean; error?: undefined }
  | { targetDir?: undefined; showGraph?: undefined; showAcd?: undefined; error: string };

export function parseArgs(args: string[]): ParsedArgs {
  const flags = args.filter((a) => a.startsWith("-"));
  const positional = args.filter((a) => !a.startsWith("-"));

  if (positional.length === 0) {
    return { error: "対象ディレクトリを指定してください。\n使い方: soame <対象ディレクトリ> [-g|-a]" };
  }

  const showGraph = flags.includes("-g");
  const showAcd = flags.includes("-a");
  return { targetDir: positional[0], showGraph, showAcd };
}
