import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes/api";

import db from "./utils/database";
import docs from "./docs/route";

async function init() {
  try {
    const result = await db();

    console.log("database status: ", result);

    const app = express();

    // Konfigurasi CORS
    const allowedOrigins = [
      process.env.CLIENT_HOST || "http://localhost:3001",
      "https://back-end-acara-hazel.vercel.app",
      "http://localhost:3000",
    ];

    const corsOptions = {
      origin: function (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    };

    app.use(cors(corsOptions));
    app.use(bodyParser.json());

    const PORT = 3000;

    app.get("/", (req, res) => {
      res.status(200).json({
        message: "server is running",
        data: null,
      });
    });

    app.use("/api", router);
    docs(app);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();
