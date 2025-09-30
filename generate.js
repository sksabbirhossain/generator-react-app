import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE = path.join(__dirname, "websites.csv");
const TEMPLATE_DIR = path.join(__dirname, "template");
const BUILD_DIR = path.join(__dirname, "build");

function safeMkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    safeMkdir(dest);
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, "utf8");
  for (const [from, to] of Object.entries(replacements)) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(filePath, content, "utf8");
}

function generateApp(row) {
  const domain = row.domain.trim();
  const appDir = path.join(BUILD_DIR, domain);

  // remove old build
  if (fs.existsSync(appDir)) {
    console.log("Removing existing", appDir);
    fs.rmSync(appDir, { recursive: true, force: true });
  }

  // copy template → appDir
  copyRecursive(TEMPLATE_DIR, appDir);

  // files we will replace in
  const headingPath = path.join(appDir, "src", "components", "Heading.jsx");
  const appPath = path.join(appDir, "src", "App.jsx");
  const indexHtml = path.join(appDir, "index.html");

  // handle [[ Quick | Fast | Speedy ]] syntax inside Heading.jsx
  const heroInput = fs.readFileSync(headingPath, "utf8");
  const match = heroInput.match(/\[\[(.*?)\]\]/);
  let chosen = "Quick";
  if (match) {
    const opts = match[1].split("|").map((s) => s.trim());
    if (opts.length > 0) chosen = opts[0];
  }

  replaceInFile(headingPath, {
    "{{HERO_CHOICE}}": chosen,
  });

  // Replace props inside App.jsx
  replaceInFile(appPath, {
    "{{phone}}": row.phone,
    "{{address}}": row.address,
  });

  // Replace meta info in index.html
  replaceInFile(indexHtml, {
    "{{TITLE}}": row.title,
    "{{DESCRIPTION}}": row.description,
  });

  // update package.json name = domain
  const pkgPath = path.join(appDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.name = domain.replace(/[^a-z0-9-_]/gi, "-");
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf8");

  console.log("✅ Generated", appDir);
}

async function main() {
  if (!fs.existsSync(CSV_FILE)) {
    console.error(
      "❌ websites.csv not found in project root. Create it first."
    );
    process.exit(1);
  }

  const csvRaw = fs.readFileSync(CSV_FILE, "utf8");
  const records = parse(csvRaw, { columns: true, skip_empty_lines: true });

  safeMkdir(BUILD_DIR);

  for (const row of records) {
    row.domain = row.domain || "unknown-domain";
    row.title = row.title || "";
    row.description = row.description || "";
    row.phone = row.phone || "";
    row.address = row.address || "";
    generateApp(row);
  }

  console.log("🎉 All apps generated into", BUILD_DIR);
}

main();
