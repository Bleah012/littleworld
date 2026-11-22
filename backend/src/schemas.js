export const itemId = {
  type: "string",
  maxLength: 100,
  pattern: "^[a-z0-9]+(-[a-z0-9]+)*$",
}

export const requestId = { type: "string", format: "uuid" }

export function fieldsSchema(properties, required = Object.keys(properties)) {
  return { type: "object", additionalProperties: false, minProperties: 1, properties, required }
}
