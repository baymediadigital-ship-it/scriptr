import { cn } from "@/lib/utils";

export function ScriptrMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center flex-shrink-0", className)}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.27),
        background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
        boxShadow: "0 0 12px rgba(124,58,237,0.4)",
      }}
    >
      <svg
        width={Math.round(size * 0.54)}
        height={Math.round(size * 0.65)}
        viewBox="0 0 13 17"
        fill="none"
      >
        <path
          d="M8.5 0.5L1 9.5H6L4.5 16.5L13 7H8L8.5 0.5Z"
          fill="white"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function ScriptrLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ScriptrMark size={30} />
      <span
        className="font-bold text-white"
        style={{ fontSize: 18, letterSpacing: "-0.04em" }}
      >
        Scriptr
      </span>
    </div>
  );
}
