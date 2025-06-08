import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import errorHandler from "./middlewares/errorHandler.js";
import authRouter from "./routes/auth.js";
import menuRouter from "./routes/menu.js";
import cartRouter from "./routes/cart.js";
import orderRouter from "./routes/orders.js";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";

// CONFIG
dotenv.config();
const app = express();
const PORT = process.env.PORT;
mongoose.connect(process.env.CONNECTION_STRING);
const database = mongoose.connection;
const swaggerDocs = YAML.load("./docs/docs.yml");

// MIDDLEWARES
app.use(express.json());

// ROUTES
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use("/api/auth", authRouter);
app.use("/api/menu", menuRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

database.on("error", (error) => {
  console.error(error);
});

database.once("connected", () => {
  console.log("DB connected");
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

// ERROR HANDLER
app.use(errorHandler);
