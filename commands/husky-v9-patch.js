const fs = require("fs");

// Update package.json
const packageJsonPath = "package.json";
const data = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
data.scripts.prepare =
  data.scripts.prepare ===
  "node -e \"try { require('husky').install() } catch (e) {if (e.code !== 'MODULE_NOT_FOUND') throw e}\""
    ? "node -e \"try { (await import('husky')).default() } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e }\" --input-type module"
    : data.scripts.prepare;
fs.writeFileSync(packageJsonPath, JSON.stringify(data, null, 2));

// Update .husky/pre-commit
const preCommitPath = ".husky/pre-commit";
if (fs.existsSync(preCommitPath)) {
  let content = fs.readFileSync(preCommitPath, "utf8");
  const linesToRemove = [
    "#!/usr/bin/env sh",
    '. "$(dirname -- "$0")/_/husky.sh"',
  ];
  content = content
    .split("\n")
    .filter((line) => !linesToRemove.includes(line))
    .join("\n");
  fs.writeFileSync(preCommitPath, content);
}
