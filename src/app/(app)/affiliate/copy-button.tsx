"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
      style={{
        background: copied ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.15)",
        border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(124,58,237,0.3)",
        color: copied ? "#4ade80" : "#c4b5fd",
      }}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy Link
        </>
      )}
    </button>
  );
}
