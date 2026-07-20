/**
 * Packages VSIX as BTF-Kabir.BidiMD-<version>.vsix (branded filename).
 * Extension id remains BTF-Kabir.bidimd (package.json name + publisher).
 */
const { execSync } = require("child_process");
const { version } = require("../package.json");

const out = `BTF-Kabir.BidiMD-${version}.vsix`;
execSync(`npx --yes @vscode/vsce package --no-dependencies --out "${out}"`, {
  stdio: "inherit",
  cwd: require("path").join(__dirname, ".."),
});
console.log(`\nBranded package: ${out}`);
