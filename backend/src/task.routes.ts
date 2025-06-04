import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";
import { Task } from "./task";

export const taskRouter = express.Router();
taskRouter.use(express.json());

// SECTION - POST
taskRouter.post("/", async (req, res): Promise<void> => {
  try {
    const {
      title,
      status,
      dueDate,
      priority = "Medium",
      tags = [],
      description,
    } = req.body;

    if (!title || title.length < 3) {
      res
        .status(400)
        .send("Title is required and must be at least 3 characters.");
      return;
    }

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      res
        .status(400)
        .send("Status must be one of: Pending, In Progress, Completed.");
      return;
    }

    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime()) || parsedDueDate <= new Date()) {
      res.status(400).send("Due date must be a valid future date.");
      return;
    }

    const uniqueTags = [...new Set(tags as string[])];
    if (tags.length !== uniqueTags.length) {
      res.status(400).send("Tags must be unique.");
      return;
    }

    const task: Task = {
      title,
      description,
      status,
      priority,
      dueDate: parsedDueDate,
      tags: uniqueTags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collections?.tasks?.insertOne(task);

    if (result?.acknowledged) {
      res.status(201).send(`Created a new task: ID ${result.insertedId}.`);
      return;
    } else {
      res.status(500).send("Failed to create a new task.");
      return;
    }
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .send(error instanceof Error ? error.message : "Unknown error");
    return;
  }
});

// SECTION - GET /tasks (list with filters)
taskRouter.get("/", async (req, res): Promise<void> => {
  try {
    const { status, priority, tags, startDate, endDate } = req.query;
    const filter: any = {};

    if (status && typeof status === "string") {
      filter.status = status;
    }

    if (priority && typeof priority === "string") {
      filter.priority = priority;
    }

    if (tags && typeof tags === "string") {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      filter.tags = { $in: tagArray };
    }

    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate && typeof startDate === "string") {
        filter.dueDate.$gte = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        filter.dueDate.$lte = new Date(endDate);
      }
    }

    const tasks = await collections.tasks
      ?.find(filter)
      .sort({ dueDate: 1 })
      .toArray();

    res.status(200).json(tasks);
    return;
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return;
  }
});

// SECTION - GET /tasks/:id
taskRouter.get("/:id", async (req, res): Promise<void> => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const task = await collections?.tasks?.findOne(query);

    if (task) {
      res.status(200).send(task);
      return;
    } else {
      res.status(404).send(`Failed to find a task: ID ${id}`);
      return;
    }
  } catch (error) {
    res.status(404).send(`Failed to find a task: ID ${req?.params?.id}`);
    return;
  }
});

// SECTION - PUT /tasks/:id
taskRouter.put("/:id", async (req, res): Promise<void> => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const existing = await collections.tasks?.findOne({
      _id: new ObjectId(id),
    });

    if (!existing) {
      res.status(404).json({ error: "Task not found." });
      return;
    }

    if (
      updates.status &&
      existing.status === "Pending" &&
      updates.status === "Completed"
    ) {
      res.status(400).json({
        error: "Cannot change status directly from Pending to Completed.",
      });
      return;
    }

    if (updates.title && updates.title.length < 3) {
      res.status(400).json({ error: "Title must be at least 3 characters." });
      return;
    }

    if (updates.dueDate && new Date(updates.dueDate) <= new Date()) {
      res.status(400).json({ error: "Due date must be in the future." });
      return;
    }

    if (updates.tags) {
      const uniqueTags = [...new Set(updates.tags)];
      if (updates.tags.length !== uniqueTags.length) {
        res.status(400).json({ error: "Tags must be unique." });
        return;
      }
      updates.tags = uniqueTags;
    }

    updates.updatedAt = new Date();

    const result = await collections?.tasks?.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (result) {
      res.status(200).json(result);
      return;
    } else {
      res.status(404).json({ error: `Task not updated. ID: ${id}` });
      return;
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid update or ID." });
    return;
  }
});

// SECTION - DELETE /tasks/:id
taskRouter.delete("/:id", async (req, res): Promise<void> => {
  try {
    const id = req.params.id;
    const result = await collections.tasks?.deleteOne({
      _id: new ObjectId(id),
    });

    if (!result?.deletedCount) {
      res.status(404).json({ error: "Task not found." });
      return;
    }

    res.status(204).send();
    return;
  } catch (error) {
    res.status(400).json({ error: "Invalid ID format." });
    return;
  }
});
