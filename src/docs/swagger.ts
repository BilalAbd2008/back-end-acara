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
      },
      ActivationRequest: {
        code: "abcdef",
      },
      CreateCategoryRequest: {
        name: "",
        description: "",
        icon: "",
      },
      CreateEventRequest: {
        name : "",
        banner : "fileUrl",
        category : "category ObjectID",
        description : "",
        startDate : "yyyy-mm-dd hh:mm:ss",
        endDate : "yyyy-mm-dd hh:mm:ss",
        location: {
            region: "region id",
            coordinates: [0, 0]
          },
        isOnline: false,
        isFeatured: false
      },
      RemoveMedidaRequest: {
        fileUrl: "",
      },
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);