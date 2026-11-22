import { getGuardianToken } from "../auth/guardian-auth.js"

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
  const token = await getGuardianToken(email, password)
  try {
    const guardian = await apiRequest("/guardian-session", { token })
    return { email: guardian.email, token }
  } catch (error) {
    if (error.status === 403) {
      throw new ApiError("Use a guardian account to manage requests.")
    }
    throw error
  }
}
