import { useEffect, useState } from "react"
export type Progress = {
  stars: number
  completed: string[]
  sessions: number
  avatar: string
}
export default function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("little-world-progress") || "null",
      )
      if (
        saved &&
        typeof saved.stars === "number" &&
        Array.isArray(saved.completed)
      )
        return { sessions: 0, avatar: "fox", ...saved }
    } catch {
      /* The playground works even when browser storage is unavailable. */
    }
    return { stars: 0, completed: [], sessions: 0, avatar: "fox" }
  })
  useEffect(() => {
    try {
      localStorage.setItem("little-world-progress", JSON.stringify(progress))
    } catch {
      /* Keep playing without storage. */
    }
  }, [progress])
  const complete = (id: string) =>
    setProgress((p) => ({
      ...p,
      stars: p.stars + 1,
      sessions: p.sessions + 1,
      completed: [...new Set([...p.completed, id])],
    }))
  return {
    progress,
    complete,
    setAvatar: (avatar: string) => setProgress((p) => ({ ...p, avatar })),
  }
}
