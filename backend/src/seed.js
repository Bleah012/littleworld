import { seedAccounts } from "./auth.js"
import { seedCatalog } from "./catalog.js"
import { auth, db } from "./firestore.js"

try {
  await seedCatalog(db)
  await seedAccounts(auth)
  console.log("Demo catalog and sign-in accounts are ready.")
} finally {
  await db.terminate()
}
