import * as vscode from "vscode";
import * as path from "path";

function isOurStyle(entry: string, stylePath: string): boolean {
  const norm = entry.replace(/\\/g, "/").toLowerCase();
  const ours = stylePath.replace(/\\/g, "/").toLowerCase();
  if (norm === ours) {
    return true;
  }
  if (norm.endsWith("/media/preview-rtl.css")) {
    return true;
  }
  return norm.includes("preview-rtl.css") && norm.includes("bidimd");
}

function configTarget(): vscode.ConfigurationTarget {
  const v = vscode.workspace
    .getConfiguration("bidimd")
    .get<"global" | "workspace">("configTarget", "global");
  return v === "workspace"
    ? vscode.ConfigurationTarget.Workspace
    : vscode.ConfigurationTarget.Global;
}

/** Read current markdown.styles without mutating foreign entries. */
function readStyles(): string[] {
  const cfg = vscode.workspace.getConfiguration("markdown");
  const raw = cfg.get<unknown>("styles", []);
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((x): x is string => typeof x === "string");
}

/**
 * Ensure our preview-rtl.css is present in markdown.styles (User or Workspace).
 * Does not remove or reorder other user styles.
 */
export async function ensureRtlStyle(stylePath: string): Promise<void> {
  const styles = readStyles();
  if (styles.some((s) => isOurStyle(s, stylePath))) {
    return;
  }
  const next = [...styles, stylePath];
  await vscode.workspace
    .getConfiguration("markdown")
    .update("styles", next, configTarget());
}

/**
 * Remove only BidiMD's stylesheet entry from markdown.styles.
 */
export async function removeRtlStyle(stylePath: string): Promise<void> {
  const styles = readStyles();
  const next = styles.filter((s) => !isOurStyle(s, stylePath));
  if (next.length === styles.length) {
    return;
  }
  await vscode.workspace
    .getConfiguration("markdown")
    .update("styles", next.length ? next : undefined, configTarget());
}

export function getStylePath(context: vscode.ExtensionContext): string {
  return context.asAbsolutePath(path.join("media", "preview-rtl.css"));
}
