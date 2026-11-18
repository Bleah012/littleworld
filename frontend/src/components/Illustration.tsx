export type World = "abc" | "numbers" | "games" | "stories" | "create" | "explore"

export function Fox({ variant = "fox" }: { variant?: string }) {
  const coat =
    variant === "panda"
      ? "var(--color-snow)"
      : variant === "bunny"
        ? "var(--color-lilac-tint)"
        : "var(--color-ember-orange)"
  return (
    <g
      stroke="var(--color-charcoal-ink)"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M153 188c-66-59-93 7-69 40 17 23 56 15 76-2" fill={coat} />
      <path
        d="M89 182c-21 9-24 28-12 45 4-16 13-21 28-23"
        fill="var(--color-snow)"
      />
      <ellipse cx="173" cy="208" rx="49" ry="59" fill={coat} />
      <ellipse cx="173" cy="217" rx="28" ry="37" fill="var(--color-snow)" />
      <path d="m127 106-7-70q38 8 47 37m26 0q29-36 48-37l-5 73" fill={coat} />
      <path d="m131 77-2-24 23 24m55 1 21-25-1 25" fill="var(--color-snow)" />
      <path
        d="M115 110c0-43 115-61 128-5 14 59-9 82-61 82-49 0-72-27-67-77"
        fill={coat}
      />
      <path
        d="M116 122c19 0 42 14 62 35 22-23 44-36 65-35-5 43-26 65-64 64-35-1-59-23-63-64"
        fill="var(--color-snow)"
      />
      {variant === "panda" && (
        <>
          <ellipse
            cx="149"
            cy="123"
            rx="15"
            ry="20"
            fill="var(--color-charcoal-ink)"
          />
          <ellipse
            cx="210"
            cy="123"
            rx="15"
            ry="20"
            fill="var(--color-charcoal-ink)"
          />
        </>
      )}
      <ellipse
        cx="149"
        cy="123"
        rx="5"
        ry="7"
        fill={
          variant === "panda"
            ? "var(--color-snow)"
            : "var(--color-charcoal-ink)"
        }
      />
      <ellipse
        cx="210"
        cy="123"
        rx="5"
        ry="7"
        fill={
          variant === "panda"
            ? "var(--color-snow)"
            : "var(--color-charcoal-ink)"
        }
      />
      <path d="M169 149q10-5 20 0l-10 10Z" fill="var(--color-charcoal-ink)" />
      <path d="M179 158v7m-10-2q10 13 21-1" fill="none" />
      <path
        d="m137 178 42 10 36-10-13 26-23-7-25 10Z"
        fill="var(--color-snow)"
      />
      <path d="m180 192 4 34 19-22" fill="var(--color-snow)" />
      <ellipse cx="147" cy="263" rx="21" ry="10" fill={coat} />
      <ellipse cx="199" cy="263" rx="21" ry="10" fill={coat} />
      <path
        d="M218 192q37-8 36-46"
        fill="none"
        stroke="var(--color-charcoal-ink)"
        strokeWidth="22"
      />
      <path
        d="M218 192q37-8 36-46"
        fill="none"
        stroke={coat}
        strokeWidth="16"
      />
      <path d="m249 139 5 7m8-2-7 8" fill="none" strokeWidth="4" />
    </g>
  )
}

export function StorybookDoodles() {
  return (
    <div className="storybook-doodles" aria-hidden="true">
      <svg
        className="doodle doodle-pencil"
        viewBox="0 0 160 190"
        fill="none"
        stroke="var(--color-charcoal-ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="rotate(22 80 100)">
          <path
            d="M54 45h44v108l-22 28-22-28Z"
            fill="var(--color-sunbeam-yellow)"
          />
          <path d="M54 45V30q22-12 44 0v15" fill="var(--color-snow)" />
          <path d="M54 55h44M67 57v91m18-91v91M54 153l13-7 9 9 9-9 13 7m-29 19 7 9 7-9M62 36h28" />
        </g>
        <path d="m111 35 14-13m-5 26 18-4M40 106l-12 3" />
      </svg>
      <svg
        className="doodle doodle-star"
        viewBox="0 0 110 110"
        stroke="var(--color-charcoal-ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      >
        <path
          d="m53 15 12 25 28 5-21 19 5 29-24-14-25 14 5-29-20-19 28-5Z"
          fill="var(--color-lilac-tint)"
        />
        <path d="M44 51v7m19-7v7m-19 8q10 10 20 0" strokeLinecap="round" />
      </svg>
      <svg
        className="doodle doodle-planet"
        viewBox="0 0 170 140"
        fill="none"
        stroke="var(--color-charcoal-ink)"
        strokeWidth="2.5"
      >
        <circle cx="84" cy="69" r="40" fill="var(--color-powder-blue)" />
        <path d="M63 38q20 11 35 4M49 65q18 4 23 16m19 12 20 8" />
        <ellipse
          cx="84"
          cy="71"
          rx="75"
          ry="17"
          transform="rotate(-25 84 71)"
        />
        <path
          d="m142 18 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"
          fill="var(--color-snow)"
        />
        <circle cx="20" cy="25" r="3" fill="var(--color-charcoal-ink)" />
      </svg>
      <svg
        className="doodle doodle-flower"
        viewBox="0 0 130 155"
        fill="none"
        stroke="var(--color-charcoal-ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M64 92v52m0-18q-31 0-34-24 30-3 34 24m0-9q29-3 33-25-28-3-33 25" />
        <path
          d="M65 26c-16-34-42-6-27 10-34 3-27 38-5 38-12 27 22 39 33 18 18 25 44 4 32-14 29-5 29-36 4-38 8-28-25-36-37-14Z"
          fill="var(--color-ember-orange)"
        />
        <circle cx="65" cy="58" r="20" fill="var(--color-snow)" />
        <path d="M57 53v4m16-4v4m-17 7q9 10 18 0" />
      </svg>
      <div className="pip-sticker">
        <svg viewBox="65 15 210 265">
          <Fox />
        </svg>
        <span>Hi! I'm Pip.</span>
        <svg
          className="pip-sticker-arrow"
          viewBox="0 0 100 60"
          fill="none"
          stroke="var(--color-charcoal-ink)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M5 50q70 2 73-40m-10 8 11-12 8 14" />
        </svg>
      </div>
      <svg
        className="doodle doodle-squiggle"
        viewBox="0 0 120 45"
        fill="none"
        stroke="var(--color-charcoal-ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M4 32q16-42 29-1 14-45 29-1 14-43 29-1 10-29 23-20" />
      </svg>
    </div>
  )
}

export default function Illustration({ kind }: { kind: World }) {
  return (
    <svg
      viewBox="0 0 240 170"
      className={`world-art art-${kind}`}
      aria-hidden="true"
    >
      <g
        stroke="var(--color-charcoal-ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="var(--color-snow)"
      >
        {kind === "abc" && (
          <>
            <g transform="rotate(-12 78 85)">
              <rect x="33" y="34" width="85" height="99" rx="15" />
              <text
                x="75"
                y="110"
                className="illustration-letter"
                stroke="none"
                fill="var(--color-charcoal-ink)"
                textAnchor="middle"
                fontSize="72"
              >
                A
              </text>
              <path d="M43 45h8m-8 0v8" />
            </g>
            <g transform="rotate(10 169 80)">
              <rect
                x="127"
                y="28"
                width="79"
                height="99"
                rx="15"
                fill="var(--art-accent)"
              />
              <text
                x="168"
                y="102"
                className="illustration-letter"
                stroke="none"
                fill="var(--color-charcoal-ink)"
                textAnchor="middle"
                fontSize="67"
              >
                B
              </text>
            </g>
            <path
              d="m105 139 4 10 11 2-9 7 2 10-8-5-9 5 2-10-8-7 11-2Z"
              fill="var(--art-accent)"
            />
            <path d="M210 17v12m-6-6h12M13 96l-7 2m4 7-7 6" />
          </>
        )}
        {kind === "numbers" && (
          <>
            <g transform="rotate(-10 76 80)">
              <rect x="36" y="45" width="70" height="100" rx="15" />
              <text
                x="70"
                y="123"
                className="illustration-letter"
                stroke="none"
                fill="var(--color-charcoal-ink)"
                textAnchor="middle"
                fontSize="78"
              >
                1
              </text>
            </g>
            <g transform="rotate(9 146 70)">
              <rect
                x="112"
                y="21"
                width="70"
                height="92"
                rx="15"
                fill="var(--art-accent)"
              />
              <text
                x="146"
                y="92"
                className="illustration-letter"
                stroke="none"
                fill="var(--color-charcoal-ink)"
                textAnchor="middle"
                fontSize="65"
              >
                2
              </text>
            </g>
            <path d="M184 121h33m-16-16v32M18 20v13m-6-6h12" />
            <circle cx="196" cy="38" r="7" fill="var(--art-accent)" />
          </>
        )}
        {kind === "games" && (
          <>
            <path
              d="M70 54h101q24 0 28 27l9 46q2 24-20 17l-32-24H82l-28 25q-25 10-23-16l9-47q5-28 30-28Z"
              fill="var(--art-accent)"
            />
            <path
              d="M69 71v35m-17-18h34"
              strokeWidth="10"
              stroke="var(--color-snow)"
            />
            <path d="M69 71v35m-17-18h34" strokeWidth="2.5" />
            <circle cx="169" cy="81" r="9" />
            <circle cx="184" cy="102" r="9" />
            <path d="M110 54q-13-18 4-26 12-7 1-20" fill="none" />
            <path d="M54 126l-11 8m146-6 10 8" />
            <path
              d="m23 34 3 9 10 3-10 3-3 9-3-9-10-3 10-3Z"
              fill="var(--art-accent)"
            />
            <path d="M209 32v12m-6-6h12" />
          </>
        )}
        {kind === "stories" && (
          <>
            <path
              d="M31 63q44-20 88-3 45-17 90 3v82q-45-16-90 0-44-16-88 0Z"
              fill="var(--art-accent)"
            />
            <path d="M37 53q42-16 82 0 40-16 83 0v83q-43-16-83 0-40-16-82 0Z" />
            <path d="M119 53v83M50 114h33m-33 9h25m-24-61h41" />
            <path d="m77 70 20 36H57Z" fill="var(--art-accent)" />
            <path d="M77 106v8" />
            <path
              d="m158 62 7 15 17 2-12 12 3 16-15-8-15 8 3-16-12-12 17-2Z"
              fill="var(--art-accent)"
            />
            <path d="M119 30v-14m-13 15-7-9m34 9 7-9" />
          </>
        )}
        {kind === "create" && (
          <>
            <path
              d="M133 27C62 13 15 83 51 123c25 31 94 31 103 6 10-25-24-12-22-34 1-17 49-45 1-68Z"
              fill="var(--art-accent)"
            />
            <circle cx="70" cy="71" r="12" />
            <circle cx="94" cy="47" r="11" />
            <circle cx="125" cy="52" r="11" />
            <circle cx="60" cy="103" r="11" />
            <ellipse cx="103" cy="114" rx="14" ry="11" />
            <path d="m162 143 22-70 12 4-22 70Z" />
            <path d="m184 73 6-22q20 16 6 27" fill="var(--art-accent)" />
            <path d="m190 50 5-11M198 29l8-9m-13 3 3-12" />
            <path
              d="m23 32 3 8 9 3-9 3-3 8-3-8-9-3 9-3Z"
              fill="var(--art-accent)"
            />
          </>
        )}
        {kind === "explore" && (
          <>
            <circle cx="121" cy="86" r="56" fill="var(--art-accent)" />
            <path d="m95 36 8 19-15 11-15-4-6 19 22 6 9 25 16 9 8-29 19-12-16-15 4-21Z" />
            <path d="m161 93-17 12 2 24 18-10 10-18Z" />
            <ellipse
              cx="120"
              cy="87"
              rx="98"
              ry="22"
              transform="rotate(-24 120 87)"
              fill="none"
            />
            <path d="m200 18 4 10 11 3-11 3-4 11-4-11-11-3 11-3Z" />
            <circle cx="41" cy="29" r="5" fill="var(--art-accent)" />
          </>
        )}
      </g>
    </svg>
  )
}
