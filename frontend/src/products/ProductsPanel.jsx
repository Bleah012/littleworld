import { useEffect, useRef, useState } from "react"
import Icon from "../components/Icon"
import { registerGuardian, resendVerification } from "../auth/guardian-auth.js"
import { apiRequest, signInGuardian } from "./products-api.js"

const catalogView = { kind: "catalog" }
const ordersView = { kind: "orders" }
const endpoint = "/order-requests"

function GuardianForm({ registering, email, submit, busy, canResend }) {
  return (
    <form className="products-form" onSubmit={(event) => {
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
      <div className="button-row products-actions">
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
    <form className="products-form" onSubmit={(event) => {
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

export default function ProductsPanel({ onBack }) {
  const [view, setView] = useState(catalogView)
  const [session, setSession] = useState(null)
  const [products, setProducts] = useState(null)
  const [orders, setOrders] = useState(null)
  const [catalogError, setCatalogError] = useState("")
  const [fetchVersion, setFetchVersion] = useState(0)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const heading = useRef(null)
  const attempt = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    apiRequest("/products", { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setProducts(data.products)
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setCatalogError(failure.message)
      })
    return () => controller.abort()
  }, [fetchVersion])

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
        setOrders(null)
        setView({ kind: "sign-in", next: view.kind === "create" ? view : ordersView })
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

  async function loadOrders(guardian) {
    const data = await apiRequest(endpoint, { token: guardian.token })
    setOrders(data.requests.sort((left, right) => right.createdAt.localeCompare(left.createdAt)))
  }

  function openOrders() {
    open(ordersView)
    if (session) {
      setOrders(null)
      run(() => loadOrders(session))
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
      if (view.next.kind === "orders") {
        setOrders(null)
        await loadOrders(guardian)
      }
    })
  }

  function register(email, password) {
    run(async () => {
      const emailSent = await registerGuardian(email, password)
      show({ kind: "verify-email", email, emailSent, next: view.next })
    })
  }

  function createOrder(quantity) {
    const productId = view.product.id
    const previous = attempt.current
    if (previous?.productId !== productId || previous.quantity !== quantity || previous.email !== session.email) {
      attempt.current = { requestId: crypto.randomUUID(), productId, quantity, email: session.email }
    }
    const { requestId } = attempt.current
    run(async () => {
      const receipt = await apiRequest(endpoint, {
        method: "POST", token: session.token, body: { requestId, productId, quantity },
      })
      attempt.current = null
      show({ kind: "receipt", receipt, product: view.product, quantity })
    })
  }

  function editOrder(quantity) {
    run(async () => {
      const updated = await apiRequest(`${endpoint}/${view.order.requestId}`, {
        method: "PATCH", token: session.token, body: { quantity },
      })
      setOrders((current) => current.map((order) => order.requestId === updated.requestId ? updated : order))
      setNotice("Quantity updated.")
      show(ordersView)
    })
  }

  function cancelOrder() {
    run(async () => {
      await apiRequest(`${endpoint}/${view.order.requestId}`, {
        method: "DELETE", token: session.token,
      })
      setOrders((current) => current.filter((order) => order.requestId !== view.order.requestId))
      setNotice("Request cancelled.")
      show(ordersView)
    })
  }

  const backToRequests = view.kind === "edit" || view.kind === "cancel"
  return (
    <div className="products-panel" aria-busy={busy}>
      <div className="button-row products-actions">
        <button className="secondary-button" type="button" disabled={busy} onClick={
          view.kind === "catalog" ? onBack : () => show(backToRequests ? ordersView : catalogView)
        }>
          <Icon name="back" />
          {view.kind === "catalog" ? "Grown-ups corner" : backToRequests ? "My requests" : "Back to products"}
        </button>
        {view.kind === "catalog" && (
          <button className="secondary-button" type="button" disabled={busy} onClick={openOrders}>My requests</button>
        )}
        {(view.kind === "catalog" || view.kind === "orders") && session && (
          <button className="secondary-button" type="button" disabled={busy} onClick={() => {
            setSession(null)
            setOrders(null)
            setNotice("")
            attempt.current = null
            show(catalogView)
          }}>Sign out</button>
        )}
      </div>

      {error && <p className="products-message" role="alert">{error}</p>}

      {view.kind === "catalog" && (
        <>
          {catalogError ? (
            <>
              <p className="products-message" role="alert">{catalogError}</p>
              <button className="secondary-button" type="button" onClick={() => {
                setCatalogError("")
                setFetchVersion((version) => version + 1)
              }}>Try again</button>
            </>
          ) : products === null ? <p role="status">Loading products…</p>
            : products.length === 0 ? <p>No products are available right now.</p>
            : (
              <ul className="products-list" aria-label="Product catalog">
                {products.map((product) => (
                  <li className="products-card" key={product.id}>
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                    </div>
                    <button className="primary-button" type="button" aria-label={`Request ${product.name}`}
                      onClick={() => { setNotice(""); open({ kind: "create", product }) }}>Request</button>
                  </li>
                ))}
              </ul>
            )}
        </>
      )}

      {view.kind === "sign-in" && (
        <section className="products-card products-section">
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
        <section className="products-card products-section">
          <h3 ref={heading} tabIndex={-1}>Create a guardian account</h3>
          <p>Parents and guardians can use their own email to manage requests.</p>
          <GuardianForm key="sign-up" registering email={view.email} submit={register} busy={busy} />
          <button className="secondary-button" type="button" disabled={busy} onClick={() => {
            show({ kind: "sign-in", email: view.email, next: view.next })
          }}>Back to sign-in</button>
        </section>
      )}

      {view.kind === "verify-email" && (
        <section className="products-card products-section">
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
        <section className="products-card products-section">
          <h3 ref={heading} tabIndex={-1}>
            {view.kind === "create" ? `Request ${view.product.name}` : `Edit ${view.order.itemName} request`}
          </h3>
          <QuantityForm initialQuantity={view.kind === "create" ? 1 : view.order.quantity}
            submit={view.kind === "create" ? createOrder : editOrder}
            busy={busy} label={view.kind === "create" ? "Send request" : "Save quantity"} />
        </section>
      )}

      {view.kind === "receipt" && (
        <section className="products-card products-section products-receipt">
          <h3 ref={heading} tabIndex={-1}>Request sent</h3>
          <p>{view.quantity} × {view.product.name}</p>
          <p className="products-reference">Reference {view.receipt.requestId}</p>
          <button className="primary-button" type="button" onClick={openOrders}>View my requests</button>
        </section>
      )}

      {view.kind === "orders" && (
        <>
          <h3 ref={heading} tabIndex={-1}>My requests</h3>
          {notice && <p role="status">{notice}</p>}
          {orders === null ? (
            error ? <button className="secondary-button" type="button" disabled={busy} onClick={openOrders}>Try again</button>
              : <p role="status">Loading requests…</p>
          ) : orders.length === 0 ? <p>You have no active product requests.</p> : (
            <ul className="products-list">
              {orders.map((order) => (
                <li className="products-card" key={order.requestId}>
                  <div><h4>{order.itemName}</h4><p>Quantity {order.quantity} · Requested</p></div>
                  <div className="button-row products-actions">
                    <button className="secondary-button" type="button" aria-label={`Edit ${order.itemName} request`}
                      onClick={() => { setNotice(""); show({ kind: "edit", order }) }}>Edit</button>
                    <button className="secondary-button" type="button" aria-label={`Cancel ${order.itemName} request`}
                      onClick={() => { setNotice(""); show({ kind: "cancel", order }) }}>Cancel</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {view.kind === "cancel" && (
        <section className="products-card products-section">
          <h3 ref={heading} tabIndex={-1}>Cancel this request?</h3>
          <p>{view.order.quantity} × {view.order.itemName}</p>
          <div className="button-row products-actions">
            <button className="secondary-button" type="button" disabled={busy} onClick={() => show(ordersView)}>Keep request</button>
            <button className="primary-button" type="button" disabled={busy} onClick={cancelOrder}>
              {busy ? "Cancelling…" : "Confirm cancellation"}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
