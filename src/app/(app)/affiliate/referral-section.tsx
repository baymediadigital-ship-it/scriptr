"use client";

import { useState } from "react";
import { CopyLinkButton } from "./copy-button";
import { AffiliateEditForm } from "./edit-form";

interface Props {
  initialCode: string;
  initialName: string;
}

export function ReferralSection({ initialCode, initialName }: Props) {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState(initialName);

  const referralLink = `https://www.getscriptr.io?ref=${code}`;

  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Your Referral Link</p>
        <AffiliateEditForm
          initialCode={code}
          initialName={name}
          onSaved={(newCode, newName) => {
            setCode(newCode);
            setName(newName);
          }}
        />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <code
          className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm font-mono truncate"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#a78bfa" }}
        >
          {referralLink}
        </code>
        <CopyLinkButton link={referralLink} />
      </div>
      <p className="text-xs text-white/30">
        Share this link. Anyone who signs up and pays becomes your referral.
      </p>
    </div>
  );
}
