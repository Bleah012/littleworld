const authUrl = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key"

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function apiRequest(path, { method = "GET", body, token, signal } = {}) {
  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === "AbortError") throw error
    throw new ApiError("The request service could not be reached. Try again.")
  }

  if (response.status === 204) return null

  const result = await response.json().catch(() => null)
  if (!response.ok || !result) {
    throw new ApiError(result?.message ?? "The request service is temporarily unavailable.", response.status)
  }
  return result
}

export async function signInGuardian(email, password) {
  let response
  try {
    response = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    })
  } catch {
    throw new ApiError("Guardian sign-in is temporarily unavailable. Try again.")
  }

  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.idToken) {
    throw new ApiError("Check your email and password and try again.")
  }

  try {
    const guardian = await apiRequest("/guardian-session", { token: result.idToken })
    return { email: guardian.email, token: result.idToken }
  } catch (error) {
    if (error.status === 403) {
      throw new ApiError("Use a guardian account to manage product requests.")
    }
    throw error
  }
}
