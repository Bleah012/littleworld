import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

export const projectId = "demo-littleworld"

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080"
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099"

const firebase = initializeApp({ projectId })
export const db = getFirestore(firebase)
export const auth = getAuth(firebase)
