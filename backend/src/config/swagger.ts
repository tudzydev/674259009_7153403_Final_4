const eventProperties = {
  title: {
    type: "string",
    minLength: 1,
    maxLength: 150,
    example: "กิจกรรมอบรม",
  },
  organizer: {
    type: "string",
    minLength: 1,
    maxLength: 100,
    example: "ผู้จัดกิจกรรม",
  },
  category: {
    type: "string",
    maxLength: 50,
    enum: ["อบรม", "สัมมนา", "จิตอาสา"],
  },
  eventDate: {
    type: "string",
    format: "date",
    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
    example: "2026-12-01",
  },
  description: {
    type: "string",
    minLength: 1,
    maxLength: 2000,
    example: "รายละเอียดกิจกรรม",
  },
  status: {
    type: "boolean",
    description:
      "Optional. Defaults to true on creation; retains the current value when omitted on update.",
    example: true,
  },
};
const requiredFields = [
  "title",
  "organizer",
  "category",
  "eventDate",
  "description",
];
const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Error" } },
  },
});
const eventResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/EventResponse" },
    },
  },
});
const requestBody = {
  required: true,
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/EventInput" } },
  },
};
const idParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "Positive event ID",
  schema: { type: "integer", format: "int32", minimum: 1, maximum: 2147483647 },
};

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Event API",
    version: "1.0.0",
    description: "Create, read, update, and delete events.",
  },
  servers: [{ url: "/", description: "Current API server" }],
  tags: [{ name: "Events" }],
  paths: {
    "/api/events": {
      get: {
        tags: ["Events"],
        operationId: "getEvents",
        summary: "List events",
        description:
          "Search title/organizer and filter by category. Ordered by eventDate ascending, then id ascending.",
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Case-insensitive literal substring of title or organizer",
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string", enum: ["อบรม", "สัมมนา", "จิตอาสา"] },
          },
        ],
        responses: {
          "200": {
            description: "Event list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Event" },
                    },
                  },
                },
              },
            },
          },
          "400": errorResponse("Invalid event filters"),
          "500": errorResponse("Internal server error"),
        },
      },
      post: {
        tags: ["Events"],
        operationId: "createEvent",
        summary: "Create an event",
        requestBody,
        responses: {
          "201": eventResponse("Event created"),
          "400": errorResponse("Invalid event input or malformed JSON"),
          "500": errorResponse("Internal server error"),
        },
      },
    },
    "/api/events/{id}": {
      parameters: [idParameter],
      get: {
        tags: ["Events"],
        operationId: "getEvent",
        summary: "Get an event",
        responses: {
          "200": eventResponse("Event found"),
          "400": errorResponse("Invalid event ID"),
          "404": errorResponse("Event not found"),
          "500": errorResponse("Internal server error"),
        },
      },
      put: {
        tags: ["Events"],
        operationId: "updateEvent",
        summary: "Update an event",
        description:
          "Send all required fields. Omitting status preserves its current value.",
        requestBody,
        responses: {
          "200": eventResponse("Event updated"),
          "400": errorResponse("Invalid event ID, input, or malformed JSON"),
          "404": errorResponse("Event not found"),
          "500": errorResponse("Internal server error"),
        },
      },
      delete: {
        tags: ["Events"],
        operationId: "deleteEvent",
        summary: "Delete an event",
        responses: {
          "200": {
            description: "Event deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["message"],
                  properties: {
                    message: { type: "string", example: "Event deleted successfully" },
                  },
                },
              },
            },
          },
          "400": errorResponse("Invalid event ID"),
          "404": errorResponse("Event not found"),
          "500": errorResponse("Internal server error"),
        },
      },
    },
  },
  components: {
    schemas: {
      EventInput: {
        type: "object",
        required: requiredFields,
        description:
          "Text fields must contain non-whitespace characters. eventDate must be a real calendar date in YYYY-MM-DD format. Extra fields are ignored.",
        properties: eventProperties,
      },
      Event: {
        type: "object",
        required: ["id", ...requiredFields, "status", "createdAt", "updatedAt"],
        properties: {
          id: {
            type: "integer",
            format: "int32",
            minimum: 1,
            readOnly: true,
            example: 1,
          },
          ...eventProperties,
          createdAt: { type: "string", format: "date-time", readOnly: true },
          updatedAt: { type: "string", format: "date-time", readOnly: true },
        },
      },
      EventResponse: {
        type: "object",
        required: ["data"],
        properties: { data: { $ref: "#/components/schemas/Event" } },
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string", example: "Invalid event input" },
        },
      },
    },
  },
};

export const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Event API — Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin="anonymous"></script>
  <script>
    if (typeof SwaggerUIBundle === "function") {
      SwaggerUIBundle({
        url: "/api-docs.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        validatorUrl: null
      });
    } else {
      document.getElementById("swagger-ui").textContent = "Swagger UI could not load. Check internet access to unpkg.com. The OpenAPI specification is available at /api-docs.json.";
    }
  </script>
</body>
</html>`;
