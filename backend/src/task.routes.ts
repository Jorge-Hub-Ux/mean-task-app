import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";
import { Task } from "./task";

export const taskRouter = express.Router();
taskRouter.use(express.json());

// SECTION - POST
taskRouter.post("/", async (req, res, next) => {
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
      throw {
        status: 400,
        message: "Title is required and must be at least 3 characters.",
      };
    }

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      throw {
        status: 400,
        message: "Status must be one of: Pending, In Progress, Completed.",
      };
    }
    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime()) || parsedDueDate <= new Date()) {
      throw { status: 400, message: "Due date must be a valid future date." };
    }
    const uniqueTags = [...new Set(tags as string[])];
    if (tags.length !== uniqueTags.length) {
      throw { status: 400, message: "Tags must be unique." };
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
      const createdTask = await collections.tasks?.findOne({
        _id: result.insertedId,
      });
      res.status(201).json(createdTask);
      return;
    } else {
      throw { status: 500, message: "Failed to create a new task." };
    }
  } catch (error) {
    next(error);
  }
});

// SECTION - GET /tasks
taskRouter.get("/", async (req, res, next) => {
  try {
    const { status, priority, tags, startDate, endDate } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (tags && typeof tags === "string")
      filter.tags = { $in: tags.split(",").map((t) => t.trim()) };
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate as string);
      if (endDate) filter.dueDate.$lte = new Date(endDate as string);
    }

    const tasks = await collections.tasks
      ?.find(filter)
      .sort({ dueDate: 1 })
      .toArray();
    res
      .status(200)
      .json({ message: "Tasks fetched successfully", data: tasks });
  } catch (error) {
    next(error);
  }
});

// SECTION - GET /tasks/:id
taskRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const task = await collections.tasks?.findOne({ _id: new ObjectId(id) });
    if (task) {
      res.status(200).json({ message: "Task fetched", data: task });
    } else {
      throw { status: 404, message: `Task not found: ID ${id}` };
    }
  } catch (error) {
    next(error);
  }
});

// SECTION - PUT /tasks/:id
taskRouter.put("/:id", async (req, res, next): Promise<void> => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const existing = await collections.tasks?.findOne({
      _id: new ObjectId(id),
    });

    if (!existing) {
      throw { status: 404, message: "Task not found." };
    }

    if (
      updates.status &&
      existing.status === "Pending" &&
      updates.status === "Completed"
    ) {
      throw {
        status: 400,
        message: "Cannot change status directly from Pending to Completed.",
      };
    }

    if (updates.title && updates.title.length < 3) {
      throw { status: 400, message: "Title must be at least 3 characters." };
    }

    if (updates.dueDate && new Date(updates.dueDate) <= new Date()) {
      throw { status: 400, message: "Due date must be in the future." };
    }

    if (updates.tags) {
      const uniqueTags = [...new Set(updates.tags)];
      if (updates.tags && updates.tags.length !== new Set(updates.tags).size) {
        throw { status: 400, message: "Tags must be unique." };
      }
      updates.tags = uniqueTags;
    }

    // Detectar qué campos cambiaron
    const changedFields: string[] = [];
    for (const key in updates) {
      if (
        key !== "updatedAt" &&
        key !== "history" &&
        updates[key] !== undefined &&
        JSON.stringify(updates[key]) !== JSON.stringify((existing as any)[key])
      ) {
        changedFields.push(key);
      }
    }

    // Si no hay cambios reales
    if (changedFields.length === 0) {
      res.status(200).json(existing);
      return;
    }

    // Crear entrada de historial
    const historyEntry = {
      changedAt: new Date(),
      changes: changedFields,
    };

    updates.updatedAt = new Date();

    // Agregar entrada de historial
    const updateDoc: any = {
      $set: updates,
      $push: { history: historyEntry },
    };

    const result = await collections.tasks?.findOneAndUpdate(
      { _id: new ObjectId(id) },
      updateDoc,
      { returnDocument: "after" }
    );

    if (result) {
      res.status(200).json(result);
    } else {
      throw { status: 404, message: `Task not updated. ID: ${id}` };
    }
  } catch (error) {
    next(error);
  }
});

// SECTION - DELETE /tasks/:id
taskRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await collections.tasks?.deleteOne({
      _id: new ObjectId(id),
    });
    if (!result?.deletedCount) {
      throw { status: 404, message: "Task not found." };
    }

    res.status(200).json({ message: "Task deleted", data: { id } });
  } catch (error) {
    next(error);
  }
});
