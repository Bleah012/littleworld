import { applicationDefault, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

const demoProjectId = "demo-littleworld"
export const projectId = process.env.LITTLE_WORLD_FIREBASE_PROJECT_ID?.trim() || demoProjectId
export const useEmulators = projectId === demoProjectId

if (useEmulators) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080"
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099"
} else if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error("Remove Firebase emulator settings before connecting to a cloud project.")
}

const firebase = initializeApp(useEmulators ? { projectId } : { projectId, credential: applicationDefault() })
export const db = getFirestore(firebase)
export const auth = getAuth(firebase)
