import { initializeApp } from "firebase/app"
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  initializeAuth,
  inMemoryPersistence,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"

const webConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
const useEmulator = !Object.values(webConfig).some(Boolean)
let auth

function getGuardianAuth() {
  if (!auth) {
    if (!useEmulator && !Object.values(webConfig).every(Boolean)) {
      throw new Error("Guardian accounts are unavailable because Firebase setup is incomplete.")
    }

    const config = useEmulator ? { apiKey: "demo-key", projectId: "demo-littleworld" } : webConfig
    auth = initializeAuth(initializeApp(config), { persistence: inMemoryPersistence })
    if (useEmulator) connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true })
  }
  return auth
}

async function withAccount(method, email, password, action, messages) {
  const guardianAuth = getGuardianAuth()
  let credentials
  try {
    credentials = await method(guardianAuth, email, password)
    return await action(credentials.user)
  } catch (error) {
    if (!error.code?.startsWith("auth/")) throw error
    throw new Error(messages[error.code] ?? "Guardian accounts are temporarily unavailable. Try again.")
  } finally {
    if (credentials) await signOut(guardianAuth)
  }
}

const signInMessages = {
  "auth/invalid-credential": "Check your email and password and try again.",
  "auth/user-not-found": "Check your email and password and try again.",
  "auth/wrong-password": "Check your email and password and try again.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
}

export function registerGuardian(email, password) {
  return withAccount(createUserWithEmailAndPassword, email, password, async (user) => {
    try {
      await sendEmailVerification(user)
      return true
    } catch {
      return false
    }
  }, {
    "auth/email-already-in-use": "This email already has an account. Sign in to continue.",
    "auth/weak-password": "Choose a stronger password and try again.",
    "auth/password-does-not-meet-requirements": "Choose a stronger password and try again.",
    "auth/too-many-requests": signInMessages["auth/too-many-requests"],
  })
}

export function getGuardianToken(email, password) {
  return withAccount(signInWithEmailAndPassword, email, password, (user) => {
    if (user.emailVerified) return user.getIdToken()
    const error = new Error("Verify your email before signing in. You can send a new verification email below.")
    error.code = "EMAIL_VERIFICATION_REQUIRED"
    throw error
  }, signInMessages)
}

export function resendVerification(email, password) {
  return withAccount(signInWithEmailAndPassword, email, password, async (user) => {
    if (user.emailVerified) throw new Error("Your email is already verified. Choose Sign in to continue.")
    await sendEmailVerification(user)
  }, signInMessages)
}
