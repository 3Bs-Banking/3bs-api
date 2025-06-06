import express, { Router } from "express";
import session from "express-session";
import morgan from "morgan";
import passport from "@/config/passportConfig";
import { DataSource } from "typeorm";
import Container from "typedi";
import { Session } from "@/models/Session";
import { TypeormStore } from "typeorm-store";
import cors from "cors";

export default function config() {
  const app = Router();

  const db = Container.get<DataSource>("db");
  const sessionRepo = db.getRepository(Session);

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors({ origin: process.env.MOBILE_APP_HOST, credentials: true }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore({ repository: sessionRepo })
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

  return app;
}
