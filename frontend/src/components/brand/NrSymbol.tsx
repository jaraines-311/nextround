interface NrSymbolProps {
  className?: string;
}

export function NrSymbol({ className }: NrSymbolProps) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Subtle circular background */}
      <circle cx="14" cy="14" r="13.5" fill="rgba(255,255,255,0.12)" />

      {/* 270° CW arc from 12 o'clock → 9 o'clock, with arrowhead */}
      <path
        d="M14 1.5 A12.5 12.5 0 1 1 1.5 14"
        stroke="#60a5fa"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Arrowhead at 9 o'clock pointing upward (direction of CW travel) */}
      <path
        d="M0 16.5 L1.5 14 L4 16"
        stroke="#60a5fa"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* NR monogram — N in white, R in brand blue, centered */}
      <text
        x="14"
        y="22"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="800"
        fontSize="12"
        fill="white"
      >
        N<tspan fill="#60a5fa">R</tspan>
      </text>
    </svg>
  );
}
