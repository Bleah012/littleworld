import { useEffect, useRef, useId, type ReactNode, type RefObject } from "react"
import Icon from "./Icon"

export default function Modal({
  title,
  onClose,
  children,
  wide = false,
  returnFocus,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  returnFocus?: RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current!
    const previous = returnFocus?.current ?? (document.activeElement as HTMLElement)
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = "hidden"
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      previous?.focus()
    }
  }, [returnFocus])
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
