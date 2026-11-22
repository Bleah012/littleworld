import { requireRoles } from "./auth.js"
import { fieldsSchema, itemId } from "./schemas.js"

const commonFields = {
  name: { type: "string", minLength: 1, maxLength: 100, pattern: "\\S" },
  description: { type: "string", minLength: 1, maxLength: 300, pattern: "\\S" },
}
const missing = { code: "ITEM_NOT_FOUND", message: "This item is unavailable." }
const params = fieldsSchema({ id: itemId })

export default function registerCatalogRoutes(app, db, auth) {
  const admin = requireRoles(auth, "admin")
  const catalogFields = {
    products: commonFields,
    services: {
      ...commonFields,
      durationMinutes: { type: "integer", minimum: 1, maximum: 180 },
    },
  }

  for (const [collection, fields] of Object.entries(catalogFields)) {
    const basePath = `/api/${collection}`
    const itemPath = `${basePath}/:id`
    const catalog = db.collection(collection)
    const view = (doc) => ({
      id: doc.id,
      ...Object.fromEntries(Object.keys(fields).map((key) => [key, doc.get(key)])),
    })

    app.get(basePath, async () => {
      const snapshot = await catalog.orderBy("name").get()
      return { [collection]: snapshot.docs.map(view) }
    })

    app.get(itemPath, { schema: { params } }, async ({ params }, reply) => {
      const item = await catalog.doc(params.id).get()
      return item.exists ? view(item) : reply.code(404).send(missing)
    })

    app.post(basePath, {
      onRequest: admin,
      schema: { body: fieldsSchema({ id: itemId, ...fields }) },
    }, async ({ body }, reply) => {
      const { id, ...details } = body
      await catalog.doc(id).create(details)
      return reply.code(201).send(body)
    })

    app.patch(itemPath, {
      onRequest: admin,
      schema: { params, body: fieldsSchema(fields, []) },
    }, async ({ params, body }, reply) => {
      const item = catalog.doc(params.id)
      const updated = await db.runTransaction(async (tx) => {
        const existing = await tx.get(item)
        if (!existing.exists) return null
        tx.update(item, body)
        return { ...view(existing), ...body }
      })
      return updated ?? reply.code(404).send(missing)
    })

    app.delete(itemPath, { onRequest: admin, schema: { params } }, async ({ params }, reply) => {
      await catalog.doc(params.id).delete()
      return reply.code(204).send()
    })
  }
}
