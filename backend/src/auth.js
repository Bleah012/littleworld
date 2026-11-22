const unauthorized = { code: "SIGN_IN_REQUIRED", message: "Sign in to continue." }
const forbidden = { code: "FORBIDDEN", message: "Your account cannot perform this action." }
const verificationRequired = {
  code: "EMAIL_VERIFICATION_REQUIRED",
  message: "Verify your email to continue.",
}

export function requireRoles(auth, ...roles) {
  return async (request, reply) => {
    const token = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization ?? "")?.[1]
    if (!token) return reply.code(401).send(unauthorized)

    let identity
    try {
      identity = await auth.verifyIdToken(token)
    } catch {
      return reply.code(401).send(unauthorized)
    }

    const passwordAccount = identity.firebase?.sign_in_provider === "password"
    const role = identity.role ?? (passwordAccount ? "guardian" : undefined)
    if (!roles.includes(role) || !identity.email) {
      return reply.code(403).send(forbidden)
    }
    if (role === "guardian" && !identity.email_verified) {
      return reply.code(403).send(verificationRequired)
    }

    request.actor = { ...identity, role }
  }
}

export const demoAccounts = [
  { email: "guardian@example.test", password: "LittleWorldGuardianDemo!", role: "guardian" },
  { email: "admin@example.test", password: "LittleWorldAdminDemo!", role: "admin" },
]

export async function seedAccounts(auth) {
  for (const { email, password, role } of demoAccounts) {
    let user
    try {
      user = await auth.getUserByEmail(email)
    } catch (error) {
      if (error.code !== "auth/user-not-found") throw error
      user = await auth.createUser({ email, password, emailVerified: true })
    }
    await auth.setCustomUserClaims(user.uid, { role })
  }
}
