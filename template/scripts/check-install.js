import { execSync } from "child_process";
import { existsSync } from "fs";

if (!existsSync("node_modules")) {
  console.log("🚀 Dependencies not found. Installing...");
  execSync("npm install", { stdio: "inherit" });
}
