import * as vscode from "vscode";
import { detectRtlDominant } from "./detect";
import { ensureRtlStyle, getStylePath, removeRtlStyle } from "./preview";

type DirectionMode = "auto" | "rtl" | "ltr";

let statusBar: vscode.StatusBarItem;
let stylePath = "";

function cfg() {
  return vscode.workspace.getConfiguration("bidimd");
}

function configTarget(): vscode.ConfigurationTarget {
  return cfg().get("configTarget") === "workspace"
    ? vscode.ConfigurationTarget.Workspace
    : vscode.ConfigurationTarget.Global;
}

async function setEnabled(enabled: boolean): Promise<void> {
  await cfg().update("enabled", enabled, configTarget());
}

async function setMode(mode: DirectionMode): Promise<void> {
  await cfg().update("directionMode", mode, configTarget());
}

function isMarkdownEditor(
  editor: vscode.TextEditor | undefined
): editor is vscode.TextEditor {
  return !!editor && editor.document.languageId === "markdown";
}

function activeMarkdownText(): string | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!isMarkdownEditor(editor)) {
    return undefined;
  }
  return editor.document.getText();
}

function shouldApplyRtl(): boolean {
  const enabled = cfg().get<boolean>("enabled", false);
  if (!enabled) {
    return false;
  }
  const mode = cfg().get<DirectionMode>("directionMode", "auto");
  if (mode === "rtl") {
    return true;
  }
  if (mode === "ltr") {
    return false;
  }
  // auto
  const text = activeMarkdownText();
  if (text === undefined) {
    return false;
  }
  return detectRtlDominant(text).rtl;
}

async function syncPreviewStyle(): Promise<void> {
  if (shouldApplyRtl()) {
    await ensureRtlStyle(stylePath);
  } else {
    await removeRtlStyle(stylePath);
  }
  updateStatusBar();
}

function statusLabel(): string {
  const enabled = cfg().get<boolean>("enabled", false);
  if (!enabled) {
    return "BidiMD: Off";
  }
  const mode = cfg().get<DirectionMode>("directionMode", "auto");
  if (mode === "rtl") {
    return "BidiMD: Force RTL";
  }
  if (mode === "ltr") {
    return "BidiMD: Force LTR";
  }
  const text = activeMarkdownText();
  if (text === undefined) {
    return "BidiMD: Auto";
  }
  return detectRtlDominant(text).rtl ? "BidiMD: Auto · RTL" : "BidiMD: Auto · LTR";
}

function updateStatusBar(): void {
  statusBar.text = statusLabel();
  statusBar.tooltip =
    "BidiMD — Markdown Preview RTL (no workbench patch). Click for Enable.";
  statusBar.show();
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  stylePath = getStylePath(context);

  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.command = "bidimd.enable";
  context.subscriptions.push(statusBar);

  context.subscriptions.push(
    vscode.commands.registerCommand("bidimd.enable", async () => {
      await setEnabled(true);
      if (!cfg().get("directionMode")) {
        await setMode("auto");
      }
      await syncPreviewStyle();
      void vscode.window.showInformationMessage(
        "BidiMD enabled. Open a Markdown preview (Ctrl+Shift+V)."
      );
    }),
    vscode.commands.registerCommand("bidimd.disable", async () => {
      await setEnabled(false);
      await removeRtlStyle(stylePath);
      updateStatusBar();
      void vscode.window.showInformationMessage(
        "BidiMD disabled. Only BidiMD stylesheet was removed."
      );
    }),
    vscode.commands.registerCommand("bidimd.auto", async () => {
      await setEnabled(true);
      await setMode("auto");
      await syncPreviewStyle();
    }),
    vscode.commands.registerCommand("bidimd.forceRtl", async () => {
      await setEnabled(true);
      await setMode("rtl");
      await syncPreviewStyle();
    }),
    vscode.commands.registerCommand("bidimd.forceLtr", async () => {
      await setEnabled(true);
      await setMode("ltr");
      await syncPreviewStyle();
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      void syncPreviewStyle();
    }),
    vscode.workspace.onDidChangeTextDocument((e) => {
      const editor = vscode.window.activeTextEditor;
      if (
        editor &&
        e.document === editor.document &&
        e.document.languageId === "markdown"
      ) {
        void syncPreviewStyle();
      }
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (
        e.affectsConfiguration("bidimd") ||
        e.affectsConfiguration("markdown.styles")
      ) {
        void syncPreviewStyle();
      }
    })
  );

  await syncPreviewStyle();
}

export function deactivate(): void {
  // Cleanup is intentional via "BidiMD: Disable" so User/Workspace markdown.styles
  // are not wiped on every window reload. Uninstall: run Disable once, or remove the
  // preview-rtl.css entry manually from markdown.styles.
}
