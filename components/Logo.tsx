interface LogoMarkProps {
  className?: string;
}

/**
 * Simbol grafic „Ne Adunam": două chevroane ascendente care converg într-un
 * vârf — energie, mișcare și adunarea echipei într-un singur punct.
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Ne Adunam"
      className={className}
    >
      <rect width="48" height="48" rx="12" className="fill-primary" />
      <path
        d="M13 28.5 24 19l11 9.5"
        className="stroke-primary-foreground"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 34.5 24 28l8 6.5"
        className="stroke-accent"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <LogoMark className="h-8 w-8" />
      <span className="text-lg font-extrabold tracking-tight text-foreground">
        Ne Adunam
      </span>
    </span>
  );
}
