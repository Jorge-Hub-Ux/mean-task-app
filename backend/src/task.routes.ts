import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";

export const taskRouter = express.Router();
taskRouter.use(express.json());

taskRouter.get("/", async (_req, res) => {
    try {
        const employees = await collections?.tasks?.find({}).toArray();
        res.status(200).send(employees);
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});