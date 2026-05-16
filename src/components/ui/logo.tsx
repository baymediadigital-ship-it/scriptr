import { cn } from "@/lib/utils";

export function ScriptrMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Scriptr"
      width={size}
      height={size}
      className={cn("rounded-xl", className)}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

export function ScriptrLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ScriptrMark size={28} />
      <span className="font-bold text-lg tracking-tight text-white" style={{ letterSpacing: "-0.03em" }}>
        Scriptr
      </span>
    </div>
  );
}
