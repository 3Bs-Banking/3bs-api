import "./config/env";
import "reflect-metadata";
import { Container } from "typedi";
import express from "express";
import { AppDataSource as db } from "./config/data-source";

async function start() {
	console.log("Initializing DB");
	await db.initialize();
	console.log(`Connected to DB: ${db.driver.database}`);
	Container.set("db", db);

	const app = express();

	app.listen(process.env.PORT || 5000, () => {
		console.log(`Server running on http://${process.env.HOST}:${process.env.PORT}`);
	});
}

start();