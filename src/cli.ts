export type ParsedArgs =
  | { targetDir: string; showGraph: boolean; showAcd: boolean; showFanInFanOut: boolean; showLcom4: boolean; error?: undefined }
  | { targetDir?: undefined; showGraph?: undefined; showAcd?: undefined; showFanInFanOut?: undefined; showLcom4?: undefined; error: string };

export function parseArgs(args: string[]): ParsedArgs {
  const flags = args.filter((a) => a.startsWith("-"));
  const positional = args.filter((a) => !a.startsWith("-"));

  if (positional.length === 0) {
    return { error: "対象ディレクトリを指定してください。\n使い方: soame <対象ディレクトリ> [-g|-a|-u|-l]" };
  }

  const showGraph = flags.includes("-g");
  const showAcd = flags.includes("-a");
  const showFanInFanOut = flags.includes("-u");
  const showLcom4 = flags.includes("-l");
  return { targetDir: positional[0], showGraph, showAcd, showFanInFanOut, showLcom4 };
}
