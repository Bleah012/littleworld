import Fastify from "fastify"
import { requireRoles } from "./auth.js"
import registerCatalogRoutes from "./catalog-routes.js"
import registerRequestRoutes from "./request-routes.js"

export default function buildApp({ db, auth }, options = {}) {
  const app = Fastify({
    ...options,
    bodyLimit: 4096,
    ajv: { customOptions: { coerceTypes: false, removeAdditional: false } },
  })

  app.decorateRequest("actor", null)
  app.removeContentTypeParser("text/plain")
  app.setErrorHandler((error, request, reply) => {
    if (error.validation || error.statusCode === 400) {
      return reply.code(400).send({
        code: "INVALID_REQUEST",
        message: "Check the request fields and try again.",
      })
    }
    if (error.code === 6) {
      return reply.code(409).send({ code: "ITEM_EXISTS", message: "This item ID is already in use." })
    }
    if (error.code === 4 || error.code === 14) {
      return reply.code(503).send({
        code: "FIRESTORE_UNAVAILABLE",
        message: "The request service is temporarily unavailable. Try again shortly.",
      })
    }
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ code: error.code, message: error.message })
    }

    request.log.error(error)
    return reply.code(500).send({
      code: "SERVER_ERROR",
      message: "We could not complete the request. Try again shortly.",
    })
  })

  app.get("/api/health", async () => ({ status: "ok" }))
  app.get("/api/guardian-session", { onRequest: requireRoles(auth, "guardian") },
    async ({ actor }) => ({ email: actor.email }))
  registerCatalogRoutes(app, db, auth)
  registerRequestRoutes(app, db, auth)

  return app
}
