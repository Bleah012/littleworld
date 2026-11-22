import { seedAccounts } from "./auth.js"
import { seedCatalog } from "./catalog.js"
import { auth, db, useEmulators } from "./firestore.js"

if (!useEmulators) throw new Error("Demo accounts and catalog can only be seeded in the local emulators.")

try {
  await seedCatalog(db)
  await seedAccounts(auth)
  console.log("Demo catalog and sign-in accounts are ready.")
} finally {
  await db.terminate()
}
