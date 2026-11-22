const unauthorized = { code: "SIGN_IN_REQUIRED", message: "Sign in to continue." }
const forbidden = { code: "FORBIDDEN", message: "Your account cannot perform this action." }

export function requireRoles(auth, ...roles) {
  return async (request, reply) => {
    const token = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization ?? "")?.[1]
    if (!token) return reply.code(401).send(unauthorized)

    try {
      request.actor = await auth.verifyIdToken(token)
    } catch {
      return reply.code(401).send(unauthorized)
    }

    if (!roles.includes(request.actor.role) || !request.actor.email) {
      return reply.code(403).send(forbidden)
    }
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
