import express from "express";
import morgan from "morgan";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorController.controller";
import userRouter from "./routes/user.route";
import healthCheckRouter from "./routes/health.route";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import path from "path";

const app = express();

app.use(cors());

app.options("*", cors());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security HTTP headers
app.use(helmet());
// Limit request from same IP
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/", limiter);

// Body purser, reading data from bodu into req.body in this case bodies larger than 10kb  will now be accepted
app.use(express.json({ limit: "50kb" }));

app.use(mongoSanitize());

express.static(path.join(__dirname, "public"));

app.use(function (req: any, res: any, next: any) {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/users", userRouter);
app.use("/api/health", healthCheckRouter);
app.all("*", (req: any, res: any, next: any) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
export default app;
