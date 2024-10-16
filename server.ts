import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import { createDefaultAdminUser } from "./controllers/user.controller";
// import Setting from "./models/settings.model";
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  process.exit(1);
});
dotenv.config({ path: "./config.env" });

// @ts-ignore
const ProdDB = process.env.DATABASE.replace(
  "<password>",
  // @ts-ignore
  process.env.DATABASE_PASSWORD
);
const localDB = process.env.LOCAL_DATABASE;
let DB = process.env.DEFAULT_DB === "local" ? localDB : ProdDB;

mongoose
  .connect(
    DB as string,
    {
      dbName: "pennyWise",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions
  )
  .then(async (con) => {
    mongoose.set("strictQuery", true);
    console.log("DB connection successful!");
  });

mongoose.connection.once("open", async () => {
  console.log("Connected to the database");
  await createDefaultAdminUser();
});

const server = app.listen(4000, function () {
  console.log("port started on 4000");
});

process.on("unhandledRejection", (err: any) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTTION! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
