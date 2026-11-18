import type { CSSProperties } from "react"

export type IconName = "home" | "learn" | "games" | "book" | "brush" | "star" | "sound" | "muted" | "arrow" | "close" | "lock" | "check" | "play" | "back" | "save" | "trash" | "eraser" | "sparkles" | "heart" | "pause" | "restart" | "globe"
const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7v10H3z" />
      <path d="M9 20v-7h6v7" />
    </>
  ),
  learn: (
    <>
      <path d="M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v15h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3z" />
      <path d="M12 6v15M6 8h3m6 0h3M6 12h3m6 0h3" />
    </>
  ),
  games: (
    <>
      <path d="M7 7h10a4 4 0 0 1 4 3l1 7a3 3 0 0 1-5 2l-3-3h-4l-3 3a3 3 0 0 1-5-2l1-7a4 4 0 0 1 4-3Z" />
      <path d="M6 10v5m-2-2h5m7-2h.01M19 14h.01" />
    </>
  ),
  book: (
    <>
      <path d="M5 3h15v18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M3 17h17M8 7h8m-8 4h6" />
    </>
  ),
  brush: (
    <>
      <path d="m11 13 8-10 3 3-10 8M11 13c-5-3-6 2-5 5-1 2-3 2-3 2s8 3 9-6" />
    </>
  ),
  star: (
    <path d="m12 2 3.1 6.4 7.1 1-5.1 5 1.2 7.1-6.3-3.4-6.3 3.4 1.2-7.1-5.1-5 7.1-1Z" />
  ),
  sound: (
    <>
      <path d="M10 4 5 8H2v8h3l5 4zM15 8a6 6 0 0 1 0 8m3-12a11 11 0 0 1 0 16" />
    </>
  ),
  muted: (
    <>
      <path d="M10 4 5 8H2v8h3l5 4zM15 9l6 6m0-6-6 6" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  back: <path d="M20 12H4m6-6-6 6 6 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  play: <path d="m8 4 13 8-13 8z" />,
  save: (
    <>
      <path d="M4 3h13l4 4v14H3V3zM7 3v7h9V3M7 21v-7h10v7" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
    </>
  ),
  eraser: (
    <>
      <path d="m3 14 10-11 9 8-10 10H9zM8 9l9 8M12 21h10" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
      <path d="M20 2v4m-2-2h4" />
    </>
  ),
  heart: <path d="M12 21 3 12a5 5 0 0 1 9-7 5 5 0 0 1 9 7z" />,
  pause: (
    <>
      <path d="M7 4v16M17 4v16" />
    </>
  ),
  restart: (
    <>
      <path d="M3 10a9 9 0 1 1 1 8M3 3v7h7" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
}
export default function Icon({
  name,
  size = 24,
  className = "",
  style,
}: {
  name: IconName
  size?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {paths[name]}
    </svg>
  )
}
