const fs = require("fs");

// Define a regex to match the old prepare script and any trailing text
const oldRequirePrepareRegex = /^node -e "try { require\('husky'\)\.install\(\) } catch \(e\) {if \(e\.code !== 'MODULE_NOT_FOUND'\) throw e}"(.*)$/;

// Update package.json
const packageJsonPath = "package.json";
const data = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
let match = data.scripts.prepare.match(oldRequirePrepareRegex);
if (match) {
  const trailingText = match[1];
  data.scripts.prepare = `node -e "try { (await import('husky')).default() } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e }" --input-type module${trailingText}`;
} else {
  const oldCliPrepareRegex = /^husky install(.*)$/;
  match = data.scripts.prepare.match(oldCliPrepareRegex);
  if (match) {
    const trailingText = match[1];
    data.scripts.prepare = `husky${trailingText}`;
  }
}
// Ensuring there is a newline at the end when writing to 'package.json'
fs.writeFileSync(packageJsonPath, JSON.stringify(data, null, 2) + "\n");

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
