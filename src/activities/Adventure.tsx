import { useEffect, useRef, useState } from "react"
import Icon from "../components/Icon"
import Illustration, { type World } from "../components/Illustration"
import Modal from "../components/Modal"

const story = [
  {
    text: "Pip found a tiny seed beside a tall tree. “What could you become?” he wondered.",
    art: "stories" as World,
  },
  {
    text: "He tucked the seed into soft soil. The sun smiled, and the rain gave it a little drink.",
    art: "explore" as World,
  },
  {
    text: "A bright flower appeared! A butterfly landed on it. Small things can make a big difference.",
    art: "create" as World,
  },
]
const questions: Record<string, {
  instruction: string
  answers: string[]
  correct: string
  hint: string
}[]> = {
  abc: [
    {
      instruction: "Which letter starts Apple?",
      answers: ["A", "B", "C"],
      correct: "A",
      hint: "Apple starts with the sound “ah”. Look for A.",
    },
    {
      instruction: "Which letter starts Bear?",
      answers: ["D", "B", "A"],
      correct: "B",
      hint: "B makes the sound “buh”, just like Bear.",
    },
    {
      instruction: "Which letter starts Cat?",
      answers: ["B", "A", "C"],
      correct: "C",
      hint: "Cat starts with C. You can do it!",
    },
  ],
  numbers: [
    {
      instruction: "How many stars can you see?",
      answers: ["2", "3", "4"],
      correct: "3",
      hint: "Point to each star: one, two, three!",
    },
    {
      instruction: "How many stars can you see?",
      answers: ["4", "5", "3"],
      correct: "5",
      hint: "Count slowly from left to right. There are five.",
    },
    {
      instruction: "How many stars can you see?",
      answers: ["4", "6", "5"],
      correct: "4",
      hint: "Count one, two, three, four!",
    },
  ],
  games: [
    {
      instruction: "Find the circle!",
      answers: ["Circle", "Square", "Triangle"],
      correct: "Circle",
      hint: "A circle is round, with no corners.",
    },
    {
      instruction: "Find the triangle!",
      answers: ["Square", "Triangle", "Circle"],
      correct: "Triangle",
      hint: "A triangle has three pointy corners.",
    },
    {
      instruction: "Find the square!",
      answers: ["Triangle", "Circle", "Square"],
      correct: "Square",
      hint: "A square has four equal sides.",
    },
  ],
  explore: [
    {
      instruction: "Where do fish live?",
      answers: ["Ocean", "Forest", "Sky"],
      correct: "Ocean",
      hint: "Fish swim in water. Choose the ocean!",
    },
    {
      instruction: "What helps a flower grow?",
      answers: ["Shoes", "Sunshine", "Books"],
      correct: "Sunshine",
      hint: "Plants love light from the sun.",
    },
    {
      instruction: "Which animal can fly?",
      answers: ["Fox", "Fish", "Bird"],
      correct: "Bird",
      hint: "Look for the animal with wings.",
    },
  ],
}
const titles: Record<World, string> = {
  abc: "ABC Land",
  numbers: "Number World",
  games: "Shape Safari",
  stories: "Pip & the tiny seed",
  create: "Creative Corner",
  explore: "Discovery World",
}

export default function Adventure({
  kind,
  onClose,
  onComplete,
  speak,
  sound,
  toggleSound,
  difficulty,
  playMinutes,
}: {
  kind: World
  onClose: () => void
  onComplete: (id: string) => void
  speak: (text: string) => void
  sound: boolean
  toggleSound: () => void
  difficulty: string
  playMinutes: number
}) {
  const [step, setStep] = useState(() => {
    try {
      return Math.min(
        2,
        Math.max(
          0,
          Number(localStorage.getItem(`little-world-step-${kind}`)) || 0,
        ),
      )
    } catch {
      return 0
    }
  })
  const [answer, setAnswer] = useState("")
  const [done, setDone] = useState(false)
  const [exit, setExit] = useState(false)
  const [paused, setPaused] = useState(false)
  const [breakTime, setBreakTime] = useState(false)
  const baseQuestion = questions[kind]?.[step]
  const q =
    baseQuestion && difficulty === "Beginner"
      ? {
          ...baseQuestion,
          answers: [
            baseQuestion.correct,
            baseQuestion.answers.find((a) => a !== baseQuestion.correct)!,
          ].sort(),
        }
      : baseQuestion && difficulty === "Super Explorer" && kind === "numbers"
        ? {
            ...baseQuestion,
            correct: String(Number(baseQuestion.correct) + 3),
            answers: baseQuestion.answers.map((a) => String(Number(a) + 3)),
            hint: "Touch each star as you count. Take your time!",
          }
        : baseQuestion
  useEffect(() => {
    const timer = window.setTimeout(
      () => setBreakTime(true),
      playMinutes * 60_000,
    )
    return () => window.clearTimeout(timer)
  }, [playMinutes])
  useEffect(() => {
    try {
      localStorage.setItem(`little-world-step-${kind}`, String(step))
    } catch {
      /* Storage is optional. */
    }
  }, [step, kind])
  const finish = () => {
    setDone(true)
    onComplete(kind)
    speak("Great job! You earned a star!")
    try {
      localStorage.removeItem(`little-world-step-${kind}`)
    } catch {
      /* Storage is optional. */
    }
  }
  const next = () => {
    if (step === 2) finish()
    else {
      setStep((s) => s + 1)
      setAnswer("")
    }
  }
  return (
    <Modal
      title={titles[kind]}
      wide={kind === "create"}
      onClose={() => (done ? onClose() : setExit(true))}
    >
      {exit ? (
        <div className="exit-panel">
          <Illustration kind="stories" />
          <h3>Go back to your world?</h3>
          <p>Your adventure will be waiting.</p>
          <div className="button-row">
            <button className="secondary-button" onClick={onClose}>
              Yes, go home
            </button>
            <button className="primary-button" onClick={() => setExit(false)}>
              Keep playing <Icon name="play" />
            </button>
          </div>
        </div>
      ) : done ? (
        <div className="celebration">
          <div className="big-earned-star">
            <Icon name="star" size={90} />
          </div>
          <div className="confetti-dots" />
          <span className="eyebrow">ONE MORE LITTLE VICTORY</span>
          <h3>You're a superstar!</h3>
          <p>You earned a star for your adventure.</p>
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={() => {
                setStep(0)
                setAnswer("")
                setDone(false)
              }}
            >
              Play again <Icon name="restart" />
            </button>
            <button className="primary-button" onClick={onClose}>
              Back to my world <Icon name="home" />
            </button>
          </div>
        </div>
      ) : breakTime ? (
        <div className="pause-panel">
          <Icon name="heart" size={56} />
          <h3>Time for a little stretch!</h3>
          <p className="modal-description">
            Rest your eyes and wiggle your toes.
          </p>
          <div className="button-row" style={{ marginTop: 25 }}>
            <button className="secondary-button" onClick={onClose}>
              Go home
            </button>
            <button
              className="primary-button"
              onClick={() => setBreakTime(false)}
            >
              Keep exploring <Icon name="play" />
            </button>
          </div>
        </div>
      ) : kind === "create" ? (
        <Drawing onComplete={finish} speak={speak} />
      ) : (
        <>
          <div className="activity-tools">
            <div className="step-dots" aria-label={`Step ${step + 1} of 3`}>
              {[0, 1, 2].map((i) => (
                <span className={i <= step ? "filled" : ""} key={i} />
              ))}
            </div>
            <div className="button-row">
              <button
                className="icon-button"
                aria-label={sound ? "Turn sound off" : "Turn sound on"}
                aria-pressed={sound}
                onClick={toggleSound}
              >
                <Icon name={sound ? "sound" : "muted"} />
              </button>
              <button
                className="icon-button"
                aria-label="Start again"
                onClick={() => {
                  setStep(0)
                  setAnswer("")
                }}
              >
                <Icon name="restart" />
              </button>
              <button
                className="icon-button"
                aria-label={paused ? "Keep playing" : "Pause activity"}
                onClick={() => setPaused(!paused)}
              >
                <Icon name={paused ? "play" : "pause"} />
              </button>
              <button
                className="icon-button"
                aria-label="Read instructions aloud"
                disabled={!sound}
                onClick={() =>
                  speak(kind === "stories" ? story[step].text : q.instruction)
                }
              >
                <Icon name="play" />
              </button>
            </div>
          </div>
          {paused ? (
            <div className="pause-panel">
              <Icon name="pause" size={56} />
              <h3>Take a little break.</h3>
              <button
                className="primary-button"
                onClick={() => setPaused(false)}
              >
                Keep playing <Icon name="play" />
              </button>
            </div>
          ) : kind === "stories" ? (
            <div className="storybook">
              <Illustration kind={story[step].art} />
              <p>{story[step].text}</p>
              <div className="button-row">
                <button
                  className="secondary-button"
                  disabled={step === 0}
                  onClick={() => setStep((s) => s - 1)}
                >
                  <Icon name="back" /> Back
                </button>
                <button className="primary-button" onClick={next}>
                  {step === 2 ? "The end!" : "Next page"} <Icon name="arrow" />
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz">
              <h3>{q.instruction}</h3>
              {kind === "numbers" ? (
                <div
                  className="counting-stars"
                  aria-label={`${q.correct} stars`}
                >
                  {Array.from({ length: Number(q.correct) }, (_, i) => (
                    <Icon key={i} name="star" size={60} />
                  ))}
                </div>
              ) : (
                <Illustration kind={kind} />
              )}
              <div className="answer-grid">
                {q.answers.map((option) => (
                  <button
                    key={option}
                    className={`answer-button ${
                      answer === option ? "selected-answer" : ""
                    }`}
                    disabled={answer === q.correct}
                    onClick={() => {
                      setAnswer(option)
                      speak(option === q.correct ? "Great job!" : q.hint)
                    }}
                  >
                    {kind === "games" && (
                      <svg viewBox="0 0 80 70" aria-hidden="true">
                        {option === "Circle" ? (
                          <circle cx="40" cy="35" r="27" fill="#d6b854" />
                        ) : option === "Square" ? (
                          <rect
                            x="13"
                            y="8"
                            width="54"
                            height="54"
                            rx="5"
                            fill="#82afa8"
                          />
                        ) : (
                          <path d="m40 5 33 57H7Z" fill="#a78bcc" />
                        )}
                      </svg>
                    )}
                    {option}
                  </button>
                ))}
              </div>
              <div
                className={`quiz-feedback ${
                  answer === q.correct ? "correct" : ""
                }`}
                aria-live="polite"
              >
                {answer &&
                  (answer === q.correct ? (
                    <>
                      <Icon name="check" /> Great job! You found it.
                    </>
                  ) : (
                    <>Almost! {q.hint}</>
                  ))}
              </div>
              {answer === q.correct && (
                <button className="primary-button" onClick={next}>
                  {step === 2 ? "Collect my star" : "Let's try another"}{" "}
                  <Icon name={step === 2 ? "star" : "arrow"} />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

function Drawing({
  onComplete,
  speak,
}: {
  onComplete: () => void
  speak: (text: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previous = useRef<{
    x: number
    y: number
  } | null>(null)
  const [color, setColor] = useState("#8b6bc1")
  const [eraser, setEraser] = useState(false)
  const [clear, setClear] = useState(false)
  const [saved, setSaved] = useState(false)
  const colors = [
    "#8b6bc1",
    "#ee9b63",
    "#e5829b",
    "#74aeb9",
    "#81ad88",
    "#efc458",
    "#3e394b",
  ]
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#fffdf9"
      ctx.fillRect(0, 0, 900, 500)
      try {
        const savedDrawing = localStorage.getItem("little-world-drawing")
        if (savedDrawing) {
          const image = new Image()
          image.onload = () => ctx.drawImage(image, 0, 0)
          image.src = savedDrawing
        }
      } catch {
        /* Drawing still works when browser storage is unavailable. */
      }
    }
  }, [])
  const preserveDrawing = () => {
    try {
      localStorage.setItem(
        "little-world-drawing",
        canvasRef.current!.toDataURL("image/png"),
      )
    } catch {
      /* A drawing can always be downloaded with Save. */
    }
  }
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) * 900) / rect.width,
      y: ((e.clientY - rect.top) * 500) / rect.height,
    }
  }
  const paint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!previous.current) return
    const ctx = canvasRef.current!.getContext("2d")!
    const p = point(e)
    ctx.beginPath()
    ctx.moveTo(previous.current.x, previous.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.strokeStyle = eraser ? "#fffdf9" : color
    ctx.lineWidth = eraser ? 35 : 9
    ctx.lineCap = "round"
    ctx.stroke()
    previous.current = p
  }
  const stamp = () => {
    const ctx = canvasRef.current!.getContext("2d")!
    ctx.fillStyle = color
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 20 : 44
      const a = (i * Math.PI) / 5 - Math.PI / 2
      const x = 100 + Math.random() * 650
      if (i === 0) {
        previous.current = { x, y: 80 + Math.random() * 340 }
      }
      const center = previous.current!
      ctx.lineTo(center.x + Math.cos(a) * r, center.y + Math.sin(a) * r)
    }
    ctx.closePath()
    ctx.fill()
    previous.current = null
    preserveDrawing()
  }
  const save = () => {
    const link = document.createElement("a")
    link.download = "my-little-masterpiece.png"
    link.href = canvasRef.current!.toDataURL("image/png")
    link.click()
    setSaved(true)
    speak("Your masterpiece is saved!")
  }
  return (
    <div className="drawing">
      <p>Make something wonderfully you.</p>
      <div className="drawing-toolbar">
        <button
          className={`icon-button ${!eraser ? "tool-active" : ""}`}
          onClick={() => setEraser(false)}
          aria-label="Brush"
          aria-pressed={!eraser}
        >
          <Icon name="brush" />
        </button>
        <button
          className={`icon-button ${eraser ? "tool-active" : ""}`}
          onClick={() => setEraser(true)}
          aria-label="Eraser"
          aria-pressed={eraser}
        >
          <Icon name="eraser" />
        </button>
        <div className="color-tools">
          {colors.map((c) => (
            <button
              key={c}
              style={{ backgroundColor: c }}
              className={`color-swatch ${color === c ? "color-active" : ""}`}
              aria-label={`Choose ${({ "#8b6bc1": "purple", "#ee9b63": "orange", "#e5829b": "pink", "#74aeb9": "blue", "#81ad88": "green", "#efc458": "yellow", "#3e394b": "dark" } as Record<string, string>)[c]}`}
              aria-pressed={color === c}
              onClick={() => {
                setColor(c)
                setEraser(false)
              }}
            />
          ))}
        </div>
        <button
          className="icon-button"
          aria-label="Add a star sticker"
          onClick={stamp}
        >
          <Icon name="star" />
        </button>
        <button
          className="icon-button"
          aria-label="Clear drawing"
          onClick={() => setClear(true)}
        >
          <Icon name="trash" />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width="900"
        height="500"
        aria-label="Drawing canvas. Draw with a mouse or finger, or use the star sticker button with your keyboard."
        onPointerDown={(e) => {
          previous.current = point(e)
          e.currentTarget.setPointerCapture(e.pointerId)
          paint(e)
        }}
        onPointerMove={paint}
        onPointerUp={() => {
          previous.current = null
          preserveDrawing()
        }}
        onPointerCancel={() => {
          previous.current = null
        }}
      />
      {clear && (
        <div className="clear-confirm">
          <p>Start a fresh picture?</p>
          <button className="secondary-button" onClick={() => setClear(false)}>
            Keep my picture
          </button>
          <button
            className="primary-button"
            onClick={() => {
              const ctx = canvasRef.current!.getContext("2d")!
              ctx.fillStyle = "#fffdf9"
              ctx.fillRect(0, 0, 900, 500)
              preserveDrawing()
              setClear(false)
            }}
          >
            Yes, start fresh
          </button>
        </div>
      )}
      <div className="button-row">
        <button className="secondary-button" onClick={save}>
          <Icon name="save" />
          {saved ? "Saved! Save again" : "Save my picture"}
        </button>
        <button className="primary-button" onClick={onComplete}>
          All finished <Icon name="check" />
        </button>
      </div>
    </div>
  )
}
