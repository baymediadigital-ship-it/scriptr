"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function AddChannel({ onAdd }: { onAdd: (channel: any) => void }) {
  const [handle, setHandle] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addChannel() {
    if (!handle.trim()) return;
    setAdding(true);
    setError(null);

    const res = await fetch("/api/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: handle.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      setHandle("");
      onAdd(data);
    }
    setAdding(false);
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex gap-2">
          <Input
            placeholder="YouTube channel handle (e.g. @mkbhd)"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addChannel()}
            className="max-w-sm"
          />
          <Button onClick={addChannel} disabled={adding || !handle.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            {adding ? "Adding…" : "Track channel"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
