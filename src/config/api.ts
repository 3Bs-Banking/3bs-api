import express, { Router } from "express";
import morgan from "morgan";

const app = Router();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

export default app;
