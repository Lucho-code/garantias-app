interface Props {
  size?: number;
  className?: string;
}

export default function AppLogo({ size = 32, className = "" }: Props) {
  const r = Math.round(size * 0.22); // border radius proporcional

  return (
    <div
      className={`shrink-0 flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
        boxShadow: "0 2px 8px rgba(109,40,217,0.35)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        style={{ width: size * 0.6, height: size * 0.6 }}
        aria-hidden
      >
        {/* Shield */}
        <path
          d="M12 2.5L4.5 6v5.5c0 5 3.5 9.7 7.5 11 4-1.3 7.5-6 7.5-11V6L12 2.5z"
          fill="rgba(255,255,255,0.18)"
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Checkmark */}
        <path
          d="M8.5 12l2.5 2.5 4.5-5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
