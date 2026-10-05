import { Link, type LinkProps } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type Props = LinkProps & {
  icon: LucideIcon;
  tone: "primary" | "secondary";
};

const tones = {
  primary: "bg-primary text-white active:bg-orquidea-900",
  secondary: "bg-secondary text-white active:bg-lavanda-600",
} as const;

export function ActionLink({ icon: Icon, tone, children, className = "", ...props }: Props) {
  return (
    <Link
      {...props}
      className={`flex h-14 items-center justify-center gap-2 rounded-tile px-4 text-base font-semibold transition-colors ${tones[tone]} ${className}`}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={2.25} />
      {children}
    </Link>
  );
}
