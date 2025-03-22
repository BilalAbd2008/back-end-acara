import mongoose from "mongoose";
import { DATABASE_URL } from "./env";

const connect = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: "db-acara",
    });

    console.log("Database Connected");
    return Promise.resolve("Database Connected");
  } catch (error) {
    console.error("Database Connection Error:", error);
    throw error; // Ini lebih baik daripada `Promise.reject(error)`
  }
};

export default connect;
