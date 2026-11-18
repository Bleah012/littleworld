import { useEffect, useRef, useId, type ReactNode } from "react"
import Icon from "./Icon"

export default function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current!
    const previous = document.activeElement as HTMLElement
    dialog.showModal()
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <div className="modal-heading">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close and go back"
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  )
}
