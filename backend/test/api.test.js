import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { after, before, test } from "node:test"
import buildApp from "../src/app.js"
import { demoAccounts, seedAccounts } from "../src/auth.js"
import { seedCatalog } from "../src/catalog.js"
import { auth, db, projectId } from "../src/firestore.js"

const app = buildApp({ auth, db })
const other = { email: "other-guardian@example.test", password: "LittleWorldOtherDemo!" }
let adminToken
let guardianToken
let otherToken

async function signIn({ email, password }) {
  const url = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key`
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })
  assert.equal(response.status, 200)
  return (await response.json()).idToken
}

function send(method, url, token, payload) {
  return app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload,
  })
}

before(async () => {
  await seedCatalog(db)
  await seedAccounts(auth)
  const account = await auth.createUser(other)
  await auth.setCustomUserClaims(account.uid, { role: "guardian" })
  const [guardian, admin] = demoAccounts
  ;[guardianToken, adminToken, otherToken] = await Promise.all([
    signIn(guardian),
    signIn(admin),
    signIn(other),
  ])
})

after(async () => {
  await app.close()
  await db.terminate()
})

test("allows public catalog reads and limits catalog changes to admins", async () => {
  assert.deepEqual((await app.inject("/api/health")).json(), { status: "ok" })

  const products = await app.inject("/api/products")
  assert.equal(products.statusCode, 200)
  assert.deepEqual(products.json().products.map(({ id }) => id), [
    "craft-kit",
    "puzzle-book",
    "star-stickers",
  ])
  const services = await app.inject("/api/services")
  assert.deepEqual(services.json().services.map(({ id }) => id), [
    "creative-workshop",
    "story-club",
  ])

  const url = "/api/products"
  const product = { id: "demo-notebook", name: "Notebook", description: "Draw stories." }
  assert.equal((await send("POST", url, null, product)).statusCode, 401)
  assert.equal((await send("POST", url, "invalid-token", product)).statusCode, 401)
  assert.equal((await send("POST", url, guardianToken, product)).statusCode, 403)
  assert.equal((await send("POST", url, adminToken, product)).statusCode, 201)
  assert.equal((await send("POST", url, adminToken, product)).statusCode, 409)

  const path = `${url}/demo-notebook`
  assert.equal((await send("PATCH", path, guardianToken, { name: "Sketchbook" })).statusCode, 403)
  assert.equal((await send("PATCH", path, adminToken, { name: "Sketchbook" })).statusCode, 200)
  assert.equal((await app.inject(path)).json().name, "Sketchbook")
  assert.equal((await send("DELETE", path, adminToken)).statusCode, 204)
  assert.equal((await app.inject(path)).statusCode, 404)
})

test("saves a guardian order, protects ownership, and handles retries and cancellation", async () => {
  const url = "/api/order-requests"
  const requestId = randomUUID()
  const detail = `${url}/${requestId}`
  const payload = { requestId, productId: "puzzle-book", quantity: 2 }

  assert.equal((await send("POST", url, null, payload)).statusCode, 401)
  const created = await send("POST", url, guardianToken, payload)
  assert.equal(created.statusCode, 201)
  assert.deepEqual(created.json(), { requestId, status: "requested" })
  assert.equal((await send("POST", url, guardianToken, payload)).statusCode, 200)
  assert.equal((await send("POST", url, guardianToken, { ...payload, quantity: 3 })).statusCode, 409)
  assert.equal((await send("POST", url, otherToken, payload)).statusCode, 404)

  const saved = await db.collection("orderRequests").doc(requestId).get()
  assert.equal(saved.get("guardianEmail"), demoAccounts[0].email)
  assert.ok(saved.get("createdAt")?.toMillis() > 0)

  assert.equal((await send("GET", detail, otherToken)).statusCode, 404)
  assert.deepEqual((await send("GET", url, otherToken)).json(), { requests: [] })
  assert.equal((await send("GET", url, adminToken)).json().requests[0].requestId, requestId)
  assert.equal((await send("GET", detail, guardianToken)).json().quantity, 2)
  assert.equal((await send("PATCH", detail, otherToken, { quantity: 3 })).statusCode, 404)
  assert.equal((await send("PATCH", detail, guardianToken, { quantity: 3 })).json().quantity, 3)
  assert.equal((await send("DELETE", detail, otherToken)).statusCode, 404)
  assert.equal((await send("DELETE", detail, guardianToken)).statusCode, 204)
  assert.equal((await send("DELETE", detail, guardianToken)).statusCode, 204)
  assert.equal((await send("GET", detail, guardianToken)).statusCode, 404)
  assert.equal((await send("POST", url, guardianToken, payload)).statusCode, 409)
})

test("supports service requests and rejects invalid order data", async () => {
  const url = "/api/service-requests"
  const requestId = randomUUID()
  const detail = `${url}/${requestId}`

  assert.equal((await send("POST", url, guardianToken, { requestId, serviceId: "missing" })).statusCode, 404)
  assert.equal((await send("POST", url, guardianToken, { requestId, serviceId: "story-club" })).statusCode, 201)
  assert.equal((await send("GET", detail, guardianToken)).json().itemName, "Story Club")
  assert.equal((await send("PATCH", detail, adminToken, { serviceId: "creative-workshop" })).json().itemName, "Creative Workshop")
  assert.equal((await send("DELETE", detail, adminToken)).statusCode, 204)

  const invalidId = randomUUID()
  const payload = { requestId: invalidId, productId: "craft-kit", quantity: 1 }
  for (const body of [
    { ...payload, quantity: "1" },
    { ...payload, quantity: 0 },
    { ...payload, guardianEmail: "someone@example.test" },
    { ...payload, childName: "Example" },
    { requestId: invalidId, quantity: 1 },
  ]) {
    const invalid = await send("POST", "/api/order-requests", guardianToken, body)
    assert.equal(invalid.statusCode, 400)
    assert.equal(invalid.json().code, "INVALID_REQUEST")
  }
  assert.equal((await db.collection("orderRequests").doc(invalidId).get()).exists, false)
})

test("Firestore rules deny direct unauthenticated reads", async () => {
  const host = process.env.FIRESTORE_EMULATOR_HOST
  const response = await fetch(
    `http://${host}/v1/projects/${projectId}/databases/(default)/documents/products/craft-kit`,
  )
  assert.equal(response.status, 403)
})
