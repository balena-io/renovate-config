#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const scriptPath = path.join(__dirname, "commands", "husky-v9-patch.js");
const configPath = path.join(__dirname, "default.json");

function encodeFileToBase64(filePath) {
  return fs.readFileSync(filePath, { encoding: "base64" });
}

function updateRenovateConfig(encodedCommand) {
  const config = JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }));
  const targetRule = config.packageRules.find(
    (rule) =>
      rule.matchPackagePatterns?.includes("^husky$") &&
      rule.matchUpdateTypes?.includes("major")
  );

  if (targetRule) {
    const command = `node -e "eval(Buffer.from('${encodedCommand}', 'base64').toString('utf-8'))"`;
    targetRule.postUpgradeTasks = targetRule.postUpgradeTasks || {};
    targetRule.postUpgradeTasks.commands = [command];
    targetRule.postUpgradeTasks.fileFilters = [
      "package.json",
      ".husky/pre-commit",
    ];

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
      encoding: "utf8",
    });
    console.log("Renovate configuration updated successfully.");
  } else {
    console.log("Target package rule not found.");
  }
}

const encodedScript = encodeFileToBase64(scriptPath);
updateRenovateConfig(encodedScript);
