import buildApp from "./app.js"
import { auth, db } from "./firestore.js"

const app = buildApp({ db, auth }, { logger: true })

await app.listen({ host: "127.0.0.1", port: 3001 })
