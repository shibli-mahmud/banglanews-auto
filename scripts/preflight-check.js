/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const requiredVars = [
  "GEMINI_API_KEY",
  "PEXELS_API_KEY",
  "NEXT_PUBLIC_ADSENSE_ID",
  "SITE_URL"
];

const optionalVars = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
  "SOCIAL_WEBHOOK_URL",
  "MAX_ARTICLES_PER_RUN",
  "REQUEST_DELAY_MS",
  "RETRY_LIMIT"
];

function checkFileExists(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  return fs.existsSync(fullPath);
}

function checkDirectoryHasMarkdown(relativeDir) {
  const fullDir = path.join(process.cwd(), relativeDir);
  if (!fs.existsSync(fullDir)) return false;
  return fs.readdirSync(fullDir).some((name) => name.endsWith(".md"));
}

function run() {
  const strict = process.env.PREFLIGHT_STRICT === "true";
  const missingRequired = requiredVars.filter((key) => !process.env[key]);
  const configuredOptional = optionalVars.filter((key) => Boolean(process.env[key]));

  const checks = [
    { label: "robots.txt exists", ok: checkFileExists("public/robots.txt") },
    { label: "sitemap exists", ok: checkFileExists("public/sitemap.xml") },
    { label: "content/en has articles", ok: checkDirectoryHasMarkdown("content/en") },
    { label: "content/bn has articles", ok: checkDirectoryHasMarkdown("content/bn") },
    { label: "fetch workflow exists", ok: checkFileExists(".github/workflows/fetch-news.yml") }
  ];

  console.log("Preflight checks:");
  for (const check of checks) {
    console.log(`- ${check.ok ? "PASS" : "FAIL"}: ${check.label}`);
  }

  if (missingRequired.length > 0) {
    const message = `Missing required env vars: ${missingRequired.join(", ")}`;
    if (strict) {
      throw new Error(message);
    }
    console.warn(`WARN: ${message}`);
  }

  console.log(`Configured optional vars: ${configuredOptional.join(", ") || "none"}`);

  const failedHardChecks = checks.filter((check) => !check.ok);
  if (failedHardChecks.length > 0) {
    throw new Error(`Preflight failed: ${failedHardChecks.map((c) => c.label).join("; ")}`);
  }

  console.log("Preflight completed successfully.");
}

run();
