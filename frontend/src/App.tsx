import { useEffect, useState } from "react"
import Icon, { type IconName } from "./components/Icon"
import Illustration, {
  Fox,
  StorybookDoodles,
  type World,
} from "./components/Illustration"
import Modal from "./components/Modal"
import Adventure from "./activities/Adventure"
import useProgress from "./hooks/useProgress"

type Page = "Home" | "Learn" | "Games" | "Stories" | "Create" | "My Stars"
const nav: {
  name: Page
  icon: IconName
}[] = [
  { name: "Home", icon: "home" },
  { name: "Learn", icon: "learn" },
  { name: "Games", icon: "games" },
  { name: "Stories", icon: "book" },
  { name: "Create", icon: "brush" },
]
const worlds: {
  id: World
  title: string
  description: string
  tag: string
  icon: IconName
}[] = [
  {
    id: "abc",
    title: "ABC Land",
    description: "Letters, words & wonder",
    tag: "Learn",
    icon: "learn",
  },
  {
    id: "numbers",
    title: "Number World",
    description: "Little numbers, big fun",
    tag: "Learn",
    icon: "learn",
  },
  {
    id: "games",
    title: "Game Zone",
    description: "Ready, set, let's play!",
    tag: "Play",
    icon: "games",
  },
  {
    id: "stories",
    title: "Story Forest",
    description: "Every book is an adventure",
    tag: "Read",
    icon: "book",
  },
  {
    id: "create",
    title: "Creative Corner",
    description: "Let your ideas bloom",
    tag: "Make",
    icon: "brush",
  },
  {
    id: "explore",
    title: "Discovery World",
    description: "A world of happy surprises",
    tag: "Explore",
    icon: "globe",
  },
]

export default function App() {
  const [page, setPage] = useState<Page>("Home")
  const [activity, setActivity] = useState<World | null>(null)
  const [sound, setSound] = useState(false)
  const [modal, setModal] = useState<"avatar" | "gate" | "parent" | null>(null)
  const [gate, setGate] = useState("")
  const [gateHint, setGateHint] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [difficulty, setDifficulty] = useState("Explorer")
  const [sessionLimit, setSessionLimit] = useState("15 minutes")
  const { progress, complete, setAvatar } = useProgress()
  const speak = (text: string) => {
    if (!sound || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.85
    utterance.pitch = 1.15
    window.speechSynthesis.speak(utterance)
  }
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    },
    [],
  )
  const go = (name: Page) => {
    setPage(name)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const toggleSound = () => {
    if (sound && "speechSynthesis" in window) window.speechSynthesis.cancel()
    setSound(!sound)
    if (!sound && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(
        "Hello, little explorer! I'm Pip. Let's discover something wonderful.",
      )
      u.rate = 0.85
      window.speechSynthesis.speak(u)
    }
  }
  const visibleWorlds =
    page === "Learn"
      ? worlds.filter((w) => ["abc", "numbers", "explore"].includes(w.id))
      : page === "Games"
        ? worlds.filter((w) => ["games", "numbers"].includes(w.id))
        : page === "Stories"
          ? worlds.filter((w) => w.id === "stories")
          : page === "Create"
            ? worlds.filter((w) => w.id === "create")
            : worlds
  return (
    <div
      className={`app ${largeText ? "large-text" : ""} ${
        reducedMotion ? "reduce-motion" : ""
      }`}
    >
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => go("Home")}
            aria-label="Little World home"
          >
            <span className="brand-icon">
              <Icon name="sparkles" size={25} />
            </span>
            <span>
              little<span className="brand-world">world</span>
              <span className="brand-dot">.</span>
            </span>
          </button>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map((n) => (
              <button
                key={n.name}
                onClick={() => go(n.name)}
                className={`nav-button ${page === n.name ? "nav-active" : ""}`}
                aria-current={page === n.name ? "page" : undefined}
              >
                <Icon name={n.icon} size={20} />
                {n.name}
              </button>
            ))}
          </nav>
          <div className="header-controls">
            <button
              className="star-counter"
              onClick={() => go("My Stars")}
              aria-label={`${progress.stars} stars collected. View my stars.`}
            >
              <Icon name="star" size={22} />
              <span>{progress.stars}</span>
            </button>
            <button
              className={`sound-button icon-button ${sound ? "sound-on" : ""}`}
              onClick={toggleSound}
              aria-label={sound ? "Turn sound off" : "Turn sound on"}
              aria-pressed={sound}
            >
              <Icon name={sound ? "sound" : "muted"} size={22} />
            </button>
            <button
              className="avatar-button"
              aria-label="Choose your explorer avatar"
              onClick={() => setModal("avatar")}
            >
              <svg viewBox="70 20 190 190" aria-hidden="true">
                <Fox variant={progress.avatar} />
              </svg>
              <span className="online-dot" />
            </button>
          </div>
        </div>
      </header>
      <main className="main-container">
        {page === "Home" ? (
          <section className="hero">
            <div className="hero-copy">
              <div className="greeting-pill">
                <span className="tiny-sun">
                  <Icon name="sparkles" size={15} />
                </span>{" "}
                A little world for big imaginations
              </div>
              <h1>
                Hi, little
                <br />
                <span className="explorer-word">
                  explorer!
                  <svg viewBox="0 0 300 16" aria-hidden="true">
                    <path d="M3 9Q133-2 292 10" />
                  </svg>
                </span>
                <span className="greeting-spark">
                  <Icon name="sparkles" size={38} />
                </span>
              </h1>
              <p>
                Big adventures start with little you.
                <br />
                What shall we discover today?
              </p>
              <button
                className="primary-button explore-button"
                onClick={() =>
                  document.getElementById("worlds")?.scrollIntoView({
                    behavior: reducedMotion ? "instant" : "smooth",
                    block: "center",
                  })
                }
              >
                Let's explore <Icon name="arrow" size={22} />
              </button>
              <div className="hero-note">Learn. Play. Make a little magic.</div>
            </div>
            <StorybookDoodles />
          </section>
        ) : (
          <section className="page-intro">
            <span className="eyebrow">YOUR NEXT LITTLE ADVENTURE</span>
            <h1>
              {page === "My Stars"
                ? "Look at you shine!"
                : page === "Learn"
                  ? "A little wonder. A lot to learn."
                  : page === "Games"
                    ? "Let's play, explorer!"
                    : page === "Stories"
                      ? "Once upon a little world…"
                      : "Imagine. Make. Smile."}
            </h1>
            <p>
              {page === "My Stars"
                ? "Every star is something wonderful you tried."
                : "Pick something you love. Pip will show you the way."}
            </p>
          </section>
        )}
        {page === "My Stars" ? (
          <section className="rewards-page">
            <div className="reward-summary">
              <Icon name="star" size={72} />
              <h2>
                {progress.stars} happy little{" "}
                {progress.stars === 1 ? "star" : "stars"}
              </h2>
              <p>
                {progress.stars
                  ? "Keep exploring. Your world is growing!"
                  : "Your adventure starts here. Try an activity to earn your first star!"}
              </p>
              <button className="primary-button" onClick={() => go("Home")}>
                Find an adventure <Icon name="arrow" />
              </button>
            </div>
            <div className="badge-grid">
              {worlds.map((w) => (
                <div
                  key={w.id}
                  className={`achievement ${
                    progress.completed.includes(w.id) ? "earned" : ""
                  }`}
                >
                  <Illustration kind={w.id} />
                  <h3>
                    {w.title
                      .replace("Land", "Explorer")
                      .replace("World", "Star")
                      .replace("Zone", "Hero")}
                  </h3>
                  <span>
                    {progress.completed.includes(w.id) ? (
                      <>
                        <Icon name="check" size={18} /> You did it!
                      </>
                    ) : (
                      "Your next little victory"
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="worlds-section" id="worlds">
              <div className="section-heading">
                <div>
                  <h2>
                    {page === "Home"
                      ? "Where will you go today?"
                      : page === "Stories"
                        ? "Pick a story, get cozy."
                        : page === "Create"
                          ? "Your ideas belong here."
                          : "Choose your adventure"}
                  </h2>
                  <p>
                    {page === "Home"
                      ? "Pick a world. Let the adventure begin."
                      : page === "Stories"
                        ? "A little story about growing something wonderful."
                        : "Small steps. Big discoveries."}
                  </p>
                </div>
                <span className="little-label">
                  <Icon name="sparkles" size={18} /> So much to discover
                </span>
              </div>
              <div
                className={`world-grid ${
                  page !== "Home" ? "filtered-grid" : ""
                }`}
              >
                {visibleWorlds.map((w) => (
                  <button
                    className={`activity-card card-${w.id}`}
                    key={w.id}
                    onClick={() => {
                      setActivity(w.id)
                      speak(`Welcome to ${w.title}. Let's explore!`)
                    }}
                  >
                    <span className="card-art">
                      <Illustration kind={w.id} />
                      {progress.completed.includes(w.id) && (
                        <span
                          className="completed-badge"
                          aria-label="Completed"
                        >
                          <Icon name="check" size={15} />
                        </span>
                      )}
                    </span>
                    <h3>{w.title}</h3>
                    <p>{w.description}</p>
                    <span className="card-bottom">
                      <span>
                        <Icon name={w.icon} size={15} /> {w.tag}
                      </span>
                      <span className="card-arrow">
                        <Icon name="arrow" size={19} />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <section className="bottom-panels">
              <div className="daily-adventure">
                <div className="daily-art">
                  <Illustration kind="numbers" />
                </div>
                <div className="daily-copy">
                  <span className="eyebrow">
                    <span className="purple-dot" /> TODAY'S LITTLE ADVENTURE
                  </span>
                  <h3>A sky full of stars</h3>
                  <p>Can you solve Pip's star puzzles?</p>
                  <span className="daily-meta">
                    <span>
                      <Icon name="star" size={15} /> Earn a star
                    </span>
                    <span className="meta-dot">·</span> 2–3 min of fun
                  </span>
                </div>
                <button
                  className="primary-button daily-button"
                  onClick={() => setActivity("numbers")}
                >
                  Let's play <Icon name="play" size={17} />
                </button>
              </div>
              <button className="progress-panel" onClick={() => go("My Stars")}>
                <div className="progress-panel-head">
                  <span className="progress-title">
                    Little steps, big smiles
                  </span>
                  <Icon name="arrow" size={20} />
                </div>
                <div
                  className="progress-stars"
                  aria-label={`${Math.min(progress.stars, 5)} of 5 adventure stars`}
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Icon
                      key={i}
                      name="star"
                      size={33}
                      className={i < progress.stars ? "star-earned" : ""}
                    />
                  ))}
                </div>
                <p>
                  {progress.stars
                    ? "Look how far you've come, explorer!"
                    : "Your first star is just an adventure away!"}
                </p>
              </button>
            </section>
          </>
        )}
        <section className="pip-note">
          <span className="pip-mini">
            <svg viewBox="70 20 190 190" aria-hidden="true">
              <Fox />
            </svg>
          </span>
          <p>
            “You don't have to be perfect. Just be curious.” <span>— Pip</span>
          </p>
          <Icon name="heart" size={19} />
        </section>
      </main>
      <footer className="site-footer">
        <span>
          <Icon name="heart" size={15} /> A safe little space to learn, play &
          grow.
        </span>
        <div>
          <span>No ads. Just adventures.</span>
          <span className="footer-dot">·</span>
          <button
            onClick={() => {
              setModal("gate")
              setGate("")
              setGateHint(false)
            }}
          >
            <Icon name="lock" size={15} /> Grown-ups corner{" "}
            <Icon name="arrow" size={15} />
          </button>
        </div>
      </footer>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[
          ...nav.slice(0, 4),
          { name: "My Stars" as Page, icon: "star" as IconName },
        ].map((n) => (
          <button
            key={n.name}
            onClick={() => go(n.name)}
            className={page === n.name ? "nav-active" : ""}
            aria-current={page === n.name ? "page" : undefined}
          >
            <Icon name={n.icon} size={23} />
            <span>{n.name === "My Stars" ? "Stars" : n.name}</span>
          </button>
        ))}
      </nav>
      {activity && (
        <Adventure
          key={activity}
          kind={activity}
          speak={speak}
          sound={sound}
          toggleSound={toggleSound}
          difficulty={difficulty}
          playMinutes={Number.parseInt(sessionLimit, 10)}
          onComplete={complete}
          onClose={() => {
            setActivity(null)
            if ("speechSynthesis" in window) window.speechSynthesis.cancel()
          }}
        />
      )}
      {modal === "avatar" && (
        <Modal title="Who's exploring today?" onClose={() => setModal(null)}>
          <p className="modal-description">Pick your little adventure buddy.</p>
          <div className="avatar-choices">
            {["fox", "panda", "bunny"].map((a) => (
              <button
                key={a}
                className={progress.avatar === a ? "avatar-selected" : ""}
                onClick={() => {
                  setAvatar(a)
                  setModal(null)
                }}
              >
                <svg viewBox="70 20 190 190" aria-hidden="true">
                  <Fox variant={a} />
                </svg>
                <span>{a[0].toUpperCase() + a.slice(1)}</span>
                {progress.avatar === a && <Icon name="check" size={18} />}
              </button>
            ))}
          </div>
          <p className="privacy-note">
            <Icon name="lock" size={16} /> No names or photos needed. Just
            imagination.
          </p>
        </Modal>
      )}
      {modal === "gate" && (
        <Modal
          title="A little gate for grown-ups"
          onClose={() => setModal(null)}
        >
          <div className="parent-gate">
            <div className="gate-icon">
              <Icon name="lock" size={35} />
            </div>
            <p>
              This corner is for parents and teachers.
              <br />
              Ask your grown-up to join you.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (gate.trim() === "12") setModal("parent")
                else setGateHint(true)
              }}
            >
              <label htmlFor="gate-answer">What is 7 + 5?</label>
              <input
                autoComplete="off"
                id="gate-answer"
                inputMode="numeric"
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                placeholder="Your answer"
              />
              {gateHint && (
                <p className="gate-hint" role="status">
                  Not quite. Ask a grown-up to help.
                </p>
              )}
              <button className="primary-button" type="submit">
                Open grown-ups corner <Icon name="arrow" />
              </button>
            </form>
          </div>
        </Modal>
      )}
      {modal === "parent" && (
        <Modal title="Grown-ups corner" onClose={() => setModal(null)}>
          <div className="parent-dashboard">
            <p>A little snapshot of your explorer's journey.</p>
            <div className="parent-stats">
              <div>
                <strong>{progress.stars}</strong>
                <span>Stars earned</span>
              </div>
              <div>
                <strong>{progress.sessions}</strong>
                <span>Activities finished</span>
              </div>
              <div>
                <strong>{progress.completed.length}</strong>
                <span>Worlds explored</span>
              </div>
            </div>
            <h3>Learning & play</h3>
            <div className="parent-practice">
              {worlds.map((w) => (
                <div key={w.id}>
                  <span>{w.title}</span>
                  <span>
                    {progress.completed.includes(w.id)
                      ? "Explored"
                      : "Ready to discover"}
                  </span>
                </div>
              ))}
            </div>
            <h3>Make it feel right</h3>
            <label className="setting-row">
              <span>Spoken instructions</span>
              <input type="checkbox" checked={sound} onChange={toggleSound} />
            </label>
            <label className="setting-row">
              <span>Larger text</span>
              <input
                type="checkbox"
                checked={largeText}
                onChange={(e) => setLargeText(e.target.checked)}
              />
            </label>
            <label className="setting-row">
              <span>Less animation</span>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
              />
            </label>
            <label className="setting-row">
              <span>Explorer level</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option>Beginner</option>
                <option>Explorer</option>
                <option>Super Explorer</option>
              </select>
            </label>
            <label className="setting-row">
              <span>Suggested playtime</span>
              <select
                value={sessionLimit}
                onChange={(e) => setSessionLimit(e.target.value)}
              >
                <option>10 minutes</option>
                <option>15 minutes</option>
                <option>20 minutes</option>
              </select>
            </label>
            <p className="privacy-note">
              <Icon name="lock" size={17} /> Progress stays on this device. No
              account, tracking, or personal information.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
