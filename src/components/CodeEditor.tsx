"use client";
import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";
if (typeof window !== "undefined")
  loader.config({
    paths: { vs: new URL("/monaco/vs", window.location.origin).href },
  });
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="editor-loading">Opening editor…</div>,
});
export default function CodeEditor({
  value,
  onChange,
  language = "typescript",
  height = 330,
}: {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: number;
}) {
  return (
    <div className="code-editor">
      <Editor
        height={height}
        theme="vs-dark"
        language={language}
        value={value}
        onChange={(v) => onChange(v || "")}
        options={{
          fontSize: 13,
          fontFamily: "Consolas, monospace",
          minimap: { enabled: false },
          padding: { top: 20 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          accessibilitySupport: "on",
        }}
      />
    </div>
  );
}
