# BidiMD

**BidiMD** by **BTF Kabir** — RTL Markdown Preview for Persian & Arabic (and Hebrew) in **VS Code** & **Cursor**.  
No workbench patch. Code blocks stay LTR.

اکستنشن **BidiMD** از **BTF Kabir** — مارک‌داون فارسی راست‌چین، کد دست‌نخورده. بدون پچ هسته.

---

## Install

- VS Marketplace / Open VSX: search **`BidiMD`**
- Or: `ext install BTF-Kabir.bidimd`

Made by **BTF Kabir** · Taught on **[Tekoya](https://www.youtube.com/@Tekoya-learn)** · [Telegram](https://t.me/Tekoya_Learn)

## Quick start

1. Install the extension  
2. Command Palette → **`BidiMD: Enable`** (or **`BidiMD: Auto`**)  
3. Open a `.md` file → **Markdown: Open Preview** (`Ctrl+Shift+V` / `Cmd+Shift+V`)  
4. Persian/Arabic-dominant docs → RTL preview; code stays LTR  

### Commands

| Command | Effect |
|---------|--------|
| `BidiMD: Enable` | Turn on (keeps current direction mode; default Auto) |
| `BidiMD: Disable` | Remove **only** BidiMD’s stylesheet from `markdown.styles` |
| `BidiMD: Auto` | RTL CSS when active Markdown looks RTL-dominant |
| `BidiMD: Force RTL` | Always inject RTL preview CSS |
| `BidiMD: Force LTR` | Keep enabled but do not inject RTL CSS |

Status bar shows: `BidiMD: Off` / `Auto · RTL` / `Force RTL` / …

### Settings

- `bidimd.enabled` — master switch  
- `bidimd.directionMode` — `auto` | `rtl` | `ltr`  
- `bidimd.configTarget` — `global` (default) or `workspace`  

## How it works

Uses the official **`markdown.styles`** API to inject `media/preview-rtl.css`.  
Does **not** patch Cursor/VS Code install files.

## Dev (local)

```bash
npm install
npm run compile
```

Then F5 (Run Extension), or `npm run package` → install `BTF-Kabir.BidiMD-*.vsix`.

## License

MIT © 2026 BTF Kabir

## Security

See [SECURITY.md](./SECURITY.md). Report issues: https://github.com/BTF-Kabir-2020/BidiMD/issues
