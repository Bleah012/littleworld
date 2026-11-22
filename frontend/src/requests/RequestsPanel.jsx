import { useEffect, useRef, useState } from "react"
import Icon from "../components/Icon"
import { registerGuardian, resendVerification } from "../auth/guardian-auth.js"
import { apiRequest, signInGuardian } from "./requests-api.js"

const catalogView = { kind: "catalog" }
const requestsView = { kind: "requests" }

function GuardianForm({ registering, email, submit, busy, canResend }) {
  return (
    <form className="request-form" onSubmit={(event) => {
      event.preventDefault()
      const data = new FormData(event.currentTarget)
      const action = event.nativeEvent.submitter?.value
      submit(String(data.get("email")).trim(), String(data.get("password")), action)
    }}>
      <label>
        Guardian email
        <input type="email" name="email" autoComplete="username" defaultValue={email} required />
      </label>
      <label>
        Password
        <input type="password" name="password"
          autoComplete={registering ? "new-password" : "current-password"}
          minLength={registering ? 6 : undefined}
          aria-describedby={registering ? "guardian-password-hint" : undefined} required />
      </label>
      {registering && <p id="guardian-password-hint">Use at least 6 characters.</p>}
      <div className="button-row request-actions">
        <button className="primary-button" type="submit" disabled={busy}>
          {registering ? "Create account" : "Sign in"}
        </button>
        {canResend && (
          <button className="secondary-button" type="submit" value="resend" disabled={busy}>
            Resend verification email
          </button>
        )}
      </div>
    </form>
  )
}

function QuantityForm({ initialQuantity, submit, busy, label }) {
  return (
    <form className="request-form" onSubmit={(event) => {
      event.preventDefault()
      const data = new FormData(event.currentTarget)
      submit(Number(data.get("quantity")))
    }}>
      <label>
        Quantity
        <input type="number" name="quantity" min="1" max="10" step="1" defaultValue={initialQuantity} required />
      </label>
      <p>Choose a quantity from 1 to 10.</p>
      <button className="primary-button" type="submit" disabled={busy}>
        {busy ? "Saving…" : label}
      </button>
    </form>
  )
}

function ServiceForm({ services, serviceId, submit, busy }) {
  const initialService = services.some((service) => service.id === serviceId) ? serviceId : ""
  return (
    <form className="request-form" onSubmit={(event) => {
      event.preventDefault()
      const data = new FormData(event.currentTarget)
      submit({ serviceId: String(data.get("serviceId")) })
    }}>
      <label>
        Service
        <select name="serviceId" defaultValue={initialService} required>
          <option value="" disabled>Choose a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {service.durationMinutes} min
            </option>
          ))}
        </select>
      </label>
      <button className="primary-button" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save service"}
      </button>
    </form>
  )
}

export default function RequestsPanel({ kind, onBack }) {
  const isService = kind === "services"
  const itemName = isService ? "service" : "product"
  const endpoint = isService ? "/service-requests" : "/order-requests"
  const [view, setView] = useState(catalogView)
  const [session, setSession] = useState(null)
  const [items, setItems] = useState(null)
  const [requests, setRequests] = useState(null)
  const [catalogError, setCatalogError] = useState("")
  const [fetchVersion, setFetchVersion] = useState(0)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const heading = useRef(null)
  const attempt = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    apiRequest(`/${kind}`, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setItems(data[kind])
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setCatalogError(failure.message)
      })
    return () => controller.abort()
  }, [kind, fetchVersion])

  useEffect(() => {
    if (view.kind !== "catalog") heading.current?.focus()
  }, [view.kind])

  function show(next) {
    setError("")
    setView(next)
  }

  function open(next) {
    show(session ? next : { kind: "sign-in", next })
  }

  async function run(action) {
    setBusy(true)
    setError("")
    try {
      await action()
    } catch (failure) {
      if (failure.status === 401 && session) {
        setSession(null)
        setRequests(null)
        setView({ kind: "sign-in", next: view.kind === "create" ? view : requestsView })
        setError("Your session has ended. Sign in again.")
      } else {
        setError(failure.message)
        if (failure.code === "EMAIL_VERIFICATION_REQUIRED") {
          setView((current) => ({ ...current, resend: true }))
        }
      }
    } finally {
      setBusy(false)
    }
  }

  function retryCatalog() {
    setCatalogError("")
    setFetchVersion((version) => version + 1)
  }

  async function loadRequests(guardian) {
    const data = await apiRequest(endpoint, { token: guardian.token })
    setRequests(data.requests.sort((left, right) => right.createdAt.localeCompare(left.createdAt)))
  }

  function openRequests() {
    open(requestsView)
    if (session) {
      setRequests(null)
      run(() => loadRequests(session))
    }
  }

  function login(email, password, action) {
    run(async () => {
      if (action === "resend") {
        await resendVerification(email, password)
        show({ kind: "verify-email", email, emailSent: true, next: view.next })
        return
      }

      const guardian = await signInGuardian(email, password)
      setSession(guardian)
      show(view.next)
      if (view.next.kind === "requests") {
        setRequests(null)
        await loadRequests(guardian)
      }
    })
  }

  function register(email, password) {
    run(async () => {
      const emailSent = await registerGuardian(email, password)
      show({ kind: "verify-email", email, emailSent, next: view.next })
    })
  }

  function createRequest(details) {
    const selection = JSON.stringify(details)
    const previous = attempt.current
    if (!previous || previous.selection !== selection || previous.email !== session.email) {
      attempt.current = { requestId: crypto.randomUUID(), selection, email: session.email }
    }
    const { requestId } = attempt.current
    run(async () => {
      const receipt = await apiRequest(endpoint, {
        method: "POST", token: session.token, body: { requestId, ...details },
      })
      attempt.current = null
      show({ kind: "receipt", receipt, item: view.item, quantity: details.quantity })
    })
  }

  function editRequest(details) {
    run(async () => {
      const updated = await apiRequest(`${endpoint}/${view.request.requestId}`, {
        method: "PATCH", token: session.token, body: details,
      })
      setRequests((current) => current.map((request) =>
        request.requestId === updated.requestId ? updated : request,
      ))
      setNotice(isService ? "Service updated." : "Quantity updated.")
      show(requestsView)
    })
  }

  function cancelRequest() {
    run(async () => {
      await apiRequest(`${endpoint}/${view.request.requestId}`, {
        method: "DELETE", token: session.token,
      })
      setRequests((current) => current.filter((request) => request.requestId !== view.request.requestId))
      setNotice("Request cancelled.")
      show(requestsView)
    })
  }

  const backToRequests = view.kind === "edit" || view.kind === "cancel"
  return (
    <div className="request-panel" aria-busy={busy}>
      <div className="button-row request-actions">
        <button className="secondary-button" type="button" disabled={busy} onClick={
          view.kind === "catalog" ? onBack : () => show(backToRequests ? requestsView : catalogView)
        }>
          <Icon name="back" />
          {view.kind === "catalog" ? "Grown-ups corner" : backToRequests ? "My requests" : `Back to ${kind}`}
        </button>
        {view.kind === "catalog" && (
          <button className="secondary-button" type="button" disabled={busy} onClick={openRequests}>My requests</button>
        )}
        {(view.kind === "catalog" || view.kind === "requests") && session && (
          <button className="secondary-button" type="button" disabled={busy} onClick={() => {
            setSession(null)
            setRequests(null)
            setNotice("")
            attempt.current = null
            show(catalogView)
          }}>Sign out</button>
        )}
      </div>

      {error && <p className="request-message" role="alert">{error}</p>}

      {view.kind === "catalog" && (
        <>
          {catalogError ? (
            <>
              <p className="request-message" role="alert">{catalogError}</p>
              <button className="secondary-button" type="button" onClick={retryCatalog}>Try again</button>
            </>
          ) : items === null ? <p role="status">Loading {kind}…</p>
            : items.length === 0 ? <p>No {kind} are available right now.</p>
            : (
              <ul className="request-list" aria-label={isService ? "Service catalog" : "Product catalog"}>
                {items.map((item) => (
                  <li className="request-card" key={item.id}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      {isService && <p>{item.durationMinutes} minutes</p>}
                    </div>
                    <button className="primary-button" type="button" aria-label={`Request ${item.name}`}
                      onClick={() => { setNotice(""); open({ kind: "create", item }) }}>Request</button>
                  </li>
                ))}
              </ul>
            )}
        </>
      )}

      {view.kind === "sign-in" && (
        <section className="request-card request-section">
          <h3 ref={heading} tabIndex={-1}>Guardian sign-in</h3>
          <p>Sign in to send and manage your requests.</p>
          <GuardianForm key="sign-in" email={view.email} submit={login} busy={busy}
            canResend={view.resend} />
          <button className="secondary-button" type="button" disabled={busy} onClick={() => {
            show({ kind: "sign-up", email: view.email, next: view.next })
          }}>Create guardian account</button>
        </section>
      )}

      {view.kind === "sign-up" && (
        <section className="request-card request-section">
          <h3 ref={heading} tabIndex={-1}>Create a guardian account</h3>
          <p>Parents and guardians can use their own email to manage requests.</p>
          <GuardianForm key="sign-up" registering email={view.email} submit={register} busy={busy} />
          <button className="secondary-button" type="button" disabled={busy} onClick={() => {
            show({ kind: "sign-in", email: view.email, next: view.next })
          }}>Back to sign-in</button>
        </section>
      )}

      {view.kind === "verify-email" && (
        <section className="request-card request-section">
          <h3 ref={heading} tabIndex={-1}>Verify your guardian email</h3>
          {view.emailSent ? (
            <p>Open the verification link sent to <strong>{view.email}</strong>, then sign in.</p>
          ) : (
            <p>Your account was created. Go back to sign-in to resend the verification email to <strong>{view.email}</strong>.</p>
          )}
          <button className="primary-button" type="button" onClick={() => {
            show({ kind: "sign-in", email: view.email, resend: true, next: view.next })
          }}>Back to sign-in</button>
        </section>
      )}

      {(view.kind === "create" || view.kind === "edit") && (
        <section className="request-card request-section">
          <h3 ref={heading} tabIndex={-1}>
            {view.kind === "create" ? `Request ${view.item.name}` : `Edit ${view.request.itemName} request`}
          </h3>
          {!isService && (
            <QuantityForm initialQuantity={view.kind === "create" ? 1 : view.request.quantity}
              submit={view.kind === "create"
                ? (quantity) => createRequest({ productId: view.item.id, quantity })
                : (quantity) => editRequest({ quantity })}
              busy={busy} label={view.kind === "create" ? "Send request" : "Save quantity"} />
          )}
          {isService && view.kind === "create" && (
            <>
              <p>{view.item.description}</p>
              <p>{view.item.durationMinutes} minutes</p>
              <button className="primary-button" type="button" disabled={busy}
                onClick={() => createRequest({ serviceId: view.item.id })}>
                {busy ? "Sending…" : "Send request"}
              </button>
            </>
          )}
          {isService && view.kind === "edit" && (
            catalogError ? (
              <>
                <p className="request-message" role="alert">{catalogError}</p>
                <button className="secondary-button" type="button" onClick={retryCatalog}>Try again</button>
              </>
            ) : items === null ? <p role="status">Loading services…</p>
              : items.length === 0 ? <p>No replacement services are available right now.</p>
              : <ServiceForm services={items} serviceId={view.request.serviceId} submit={editRequest} busy={busy} />
          )}
        </section>
      )}

      {view.kind === "receipt" && (
        <section className="request-card request-section request-receipt">
          <h3 ref={heading} tabIndex={-1}>Request sent</h3>
          <p>{isService ? `${view.item.name} · ${view.item.durationMinutes} minutes` : `${view.quantity} × ${view.item.name}`}</p>
          <p className="request-reference">Reference {view.receipt.requestId}</p>
          <button className="primary-button" type="button" onClick={openRequests}>View my requests</button>
        </section>
      )}

      {view.kind === "requests" && (
        <>
          <h3 ref={heading} tabIndex={-1}>My requests</h3>
          {notice && <p role="status">{notice}</p>}
          {requests === null ? (
            error ? <button className="secondary-button" type="button" disabled={busy} onClick={openRequests}>Try again</button>
              : <p role="status">Loading requests…</p>
          ) : requests.length === 0 ? <p>You have no active {itemName} requests.</p> : (
            <ul className="request-list">
              {requests.map((request) => (
                <li className="request-card" key={request.requestId}>
                  <div>
                    <h4>{request.itemName}</h4>
                    <p>{isService ? "Requested" : `Quantity ${request.quantity} · Requested`}</p>
                  </div>
                  <div className="button-row request-actions">
                    <button className="secondary-button" type="button" aria-label={`Edit ${request.itemName} request`}
                      onClick={() => { setNotice(""); show({ kind: "edit", request }) }}>Edit</button>
                    <button className="secondary-button" type="button" aria-label={`Cancel ${request.itemName} request`}
                      onClick={() => { setNotice(""); show({ kind: "cancel", request }) }}>Cancel</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {view.kind === "cancel" && (
        <section className="request-card request-section">
          <h3 ref={heading} tabIndex={-1}>Cancel this request?</h3>
          <p>{isService ? view.request.itemName : `${view.request.quantity} × ${view.request.itemName}`}</p>
          <div className="button-row request-actions">
            <button className="secondary-button" type="button" disabled={busy} onClick={() => show(requestsView)}>Keep request</button>
            <button className="primary-button" type="button" disabled={busy} onClick={cancelRequest}>
              {busy ? "Cancelling…" : "Confirm cancellation"}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
