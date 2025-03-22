import swaggerAutogen from "swagger-autogen";

const doc = {
  openapi: "3.0.0",
  info: {
    version: "v0.0.1",
    title: "Dokumentasi API acara",
    description: "Dokumentasi API acara"
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local Server",
    },
    {
      url: "https://back-end-acara-hazel.vercel.app/api",
      description: "Deploy Server"
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      LoginRequest: {
        identifier: "Bilal",
        password: "12345"
      }
    }
  }
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);