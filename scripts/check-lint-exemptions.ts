// Fails when a commit adds a file to a size-limit exemption in .oxlintrc.json.
// The exemptions are for files that were already over a limit when the rule
// came in. They only shrink: a split moves code into new files, and the new
// files must pass the limits, so the exemption does not move with the code.
// Compares the staged .oxlintrc.json with HEAD's.
// Usage: tsx scripts/check-lint-exemptions.ts

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const CONFIG = ".oxlintrc.json";
const SIZE_RULES = [
  "max-lines",
  "max-lines-per-function",
  "max-params",
  "max-depth",
];

type Override = { files?: string[]; rules?: Record<string, unknown> };

/** rule -> the files exempted from it */
function exemptions(text: string): Map<string, Set<string>> {
  const { config, error } = ts.parseConfigFileTextToJson(CONFIG, text);
  if (error) throw new Error(`Cannot parse ${CONFIG}`);
  const overrides: Override[] = config.overrides ?? [];
  const byRule = new Map(SIZE_RULES.map((rule) => [rule, new Set<string>()]));
  for (const { files = [], rules = {} } of overrides) {
    for (const rule of SIZE_RULES) {
      // "off" or a looser setting: either way the file escapes the limit.
      if (rules[rule] === undefined) continue;
      for (const file of files) byRule.get(rule)?.add(file);
    }
  }
  return byRule;
}

export function addedExemptions(
  beforeText: string,
  afterText: string
): { rule: string; file: string }[] {
  const before = exemptions(beforeText);
  return [...exemptions(afterText)].flatMap(([rule, files]) =>
    [...files]
      .filter((file) => !before.get(rule)?.has(file))
      .map((file) => ({ rule, file }))
  );
}

function main() {
  const git = (spec: string) =>
    execFileSync("git", ["show", spec], { encoding: "utf8" });
  let before: string;
  try {
    before = git(`HEAD:${CONFIG}`);
  } catch {
    return; // No HEAD version to compare against.
  }
  const added = addedExemptions(before, git(`:${CONFIG}`));
  if (added.length === 0) return;

  console.error(`This commit adds size-limit exemptions to ${CONFIG}:\n`);
  for (const { rule, file } of added) console.error(`  ${rule}: ${file}`);
  console.error(`
The exemptions only shrink. Take the entries out and bring each file under
the limit: split the long functions, files or parameter lists. Code moved out
of an exempted file must pass the limits in its new file.`);
  process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
