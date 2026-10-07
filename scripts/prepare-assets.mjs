import { mkdir, copyFile, cp } from "node:fs/promises";
await mkdir("public/monaco", { recursive: true });
await copyFile("node_modules/sql.js/dist/sql-wasm.js", "public/sql-wasm.js");
await copyFile(
  "node_modules/sql.js/dist/sql-wasm.wasm",
  "public/sql-wasm.wasm",
);
await cp("node_modules/monaco-editor/min/vs", "public/monaco/vs", {
  recursive: true,
});
console.log("Local SQL and Monaco assets are ready.");
