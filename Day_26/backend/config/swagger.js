const swaggerAutogen = require("swagger-autogen");

const routes = ["../routes/api/v1/api.js"];

const doc = {
  info: {
    version: "1.0.0",
    title: "Hotel Booking API",
    description: "API documentation",
  },
  host: "localhost:8000",
  basePath: "/api/v1",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "OpenApi",
      description: "OpenApis APIs"
    },
    {
      name: "Authentication",
      description: "User management APIs",
    },
    {
      name: "UserManage",
      description: "Users management APIs for authorized roles"
    },
    {
      name: "Roles",
      description: "Role management APIs",
    },
    {
      name: "Rooms",
      description: "Room management APIs",
    },
    {
      name: "Bookings",
      description: "Booking management APIs",
    },
    {
      name: "BookingApproval",
      description: "Approval management APIs",
    },
    {
      name: "Report",
      description: "Report management APIs",
    },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Enter JWT token as: Bearer <token>",
    },
  },
};

const outputFile = "../swagger-output.json";

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc);
