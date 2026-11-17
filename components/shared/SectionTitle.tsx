import type { ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  children,
  align = "left",
}: {
  eyebrow?: string;
  children: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`section-title section-title-${align}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{children}</h2>
    </div>
  );
}
