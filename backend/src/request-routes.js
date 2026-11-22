import { FieldValue } from "firebase-admin/firestore"
import { requireRoles } from "./auth.js"
import { fieldsSchema, itemId, requestId } from "./schemas.js"

const errors = {
  404: { code: "NOT_FOUND", message: "This request or catalog item is unavailable." },
  409: { code: "REQUEST_CONFLICT", message: "This request ID has already been used." },
}
const params = fieldsSchema({ requestId })

function canManage(doc, actor) {
  return doc.exists && (actor.role === "admin" || doc.get("guardianUid") === actor.uid)
}

function requestView(doc) {
  const { guardianUid, createdAt, ...data } = doc.data()
  return { requestId: doc.id, ...data, createdAt: createdAt.toDate().toISOString() }
}

export default function registerRequestRoutes(app, db, auth) {
  const signedIn = requireRoles(auth, "guardian", "admin")
  const types = [
    {
      route: "/api/order-requests",
      collection: "orderRequests",
      catalog: "products",
      item: "productId",
      fields: { productId: itemId, quantity: { type: "integer", minimum: 1, maximum: 10 } },
    },
    {
      route: "/api/service-requests",
      collection: "serviceRequests",
      catalog: "services",
      item: "serviceId",
      fields: { serviceId: itemId },
    },
  ]

  for (const { route, collection, catalog, item, fields } of types) {
    const requests = db.collection(collection)
    const items = db.collection(catalog)
    const detailRoute = `${route}/:requestId`
    const getRef = (id) => requests.doc(id.toLowerCase())

    app.get(route, { onRequest: signedIn }, async ({ actor }) => {
      let query = requests.where("status", "==", "requested")
      if (actor.role !== "admin") query = query.where("guardianUid", "==", actor.uid)
      const result = await query.get()
      return { requests: result.docs.map(requestView) }
    })

    app.get(detailRoute, { onRequest: signedIn, schema: { params } }, async (request, reply) => {
      const doc = await getRef(request.params.requestId).get()
      if (!canManage(doc, request.actor) || doc.get("status") === "cancelled") {
        return reply.code(404).send(errors[404])
      }
      return requestView(doc)
    })

    app.post(route, {
      onRequest: signedIn,
      schema: { body: fieldsSchema({ requestId, ...fields }) },
    }, async ({ body, actor }, reply) => {
      const { requestId, ...details } = body
      const record = getRef(requestId)
      const status = await db.runTransaction(async (tx) => {
        const existing = await tx.get(record)
        if (existing.exists) {
          if (existing.get("guardianUid") !== actor.uid) return 404
          const matches = Object.entries(details).every(([field, value]) => existing.get(field) === value)
          return existing.get("status") === "requested" && matches ? 200 : 409
        }

        const selection = await tx.get(items.doc(details[item]))
        if (!selection.exists) return 404
        tx.create(record, {
          ...details,
          itemName: selection.get("name"),
          guardianUid: actor.uid,
          guardianEmail: actor.email,
          status: "requested",
          createdAt: FieldValue.serverTimestamp(),
        })
        return 201
      })
      return reply.code(status).send(errors[status] ?? { requestId: record.id, status: "requested" })
    })

    app.patch(detailRoute, {
      onRequest: signedIn,
      schema: { params, body: fieldsSchema(fields, []) },
    }, async (request, reply) => {
      const record = getRef(request.params.requestId)
      const updated = await db.runTransaction(async (tx) => {
        const doc = await tx.get(record)
        if (!canManage(doc, request.actor) || doc.get("status") === "cancelled") return null

        const changes = { ...request.body }
        if (changes[item]) {
          const selection = await tx.get(items.doc(changes[item]))
          if (!selection.exists) return null
          changes.itemName = selection.get("name")
        }

        tx.update(record, changes)
        return { ...requestView(doc), ...changes }
      })
      return updated ?? reply.code(404).send(errors[404])
    })

    app.delete(detailRoute, { onRequest: signedIn, schema: { params } }, async (request, reply) => {
      const record = getRef(request.params.requestId)
      const cancelled = await db.runTransaction(async (tx) => {
        const doc = await tx.get(record)
        if (!canManage(doc, request.actor)) return false
        if (doc.get("status") !== "cancelled") tx.update(record, { status: "cancelled" })
        return true
      })
      return cancelled ? reply.code(204).send() : reply.code(404).send(errors[404])
    })
  }
}
