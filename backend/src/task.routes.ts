import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";
import { Task } from "./task";

export const taskRouter = express.Router();
taskRouter.use(express.json());

const errorResponse = (
  res: express.Response,
  status: number,
  message: string
) => {
  const titles: Record<number, string> = {
    400: "Bad Request",
    404: "Not Found",
    500: "Server Error",
  };
  res.status(status).json({
    errorTitle: titles[status] || "Error",
    message,
    statusCode: status,
  });
};

// SECTION - POST
taskRouter.post("/", async (req, res) => {
  try {
    const {
      title,
      status,
      dueDate,
      priority = "Medium",
      tags = [],
      description,
    } = req.body;

    if (!title || title.length < 3)
      return errorResponse(res, 400, "Title must be at least 3 characters.");
    if (!["Pending", "In Progress", "Completed"].includes(status))
      return errorResponse(res, 400, "Invalid status.");
    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime()) || parsedDueDate <= new Date())
      return errorResponse(res, 400, "Invalid future due date.");
    const uniqueTags = [...new Set(tags as string[])];
    if (tags.length !== uniqueTags.length)
      return errorResponse(res, 400, "Tags must be unique.");

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

    const result = await collections.tasks?.insertOne(task);
    if (result?.acknowledged) {
      res.status(201).json({
        message: "Task created successfully",
        data: { id: result.insertedId },
      });
    } else {
      errorResponse(res, 500, "Failed to create a new task.");
    }
  } catch (error) {
    errorResponse(
      res,
      500,
      error instanceof Error ? error.message : "Unknown error."
    );
  }
});

// SECTION - GET /tasks
taskRouter.get("/", async (req, res) => {
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
    errorResponse(res, 500, "Error retrieving tasks.");
  }
});

// SECTION - GET /tasks/:id
taskRouter.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const task = await collections.tasks?.findOne({ _id: new ObjectId(id) });
    if (task) {
      res.status(200).json({ message: "Task fetched", data: task });
    } else {
      errorResponse(res, 404, `Task not found with ID: ${id}`);
    }
  } catch {
    errorResponse(res, 400, "Invalid task ID format.");
  }
});

// SECTION - PUT /tasks/:id
taskRouter.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const existing = await collections.tasks?.findOne({
      _id: new ObjectId(id),
    });
    if (!existing) return errorResponse(res, 404, "Task not found.");

    if (
      updates.status &&
      existing.status === "Pending" &&
      updates.status === "Completed"
    ) {
      return errorResponse(
        res,
        400,
        "Cannot change status directly from Pending to Completed."
      );
    }

    if (updates.title && updates.title.length < 3)
      return errorResponse(res, 400, "Title too short.");
    if (updates.dueDate && new Date(updates.dueDate) <= new Date())
      return errorResponse(res, 400, "Due date must be in the future.");
    if (updates.tags) {
      const uniqueTags = [...new Set(updates.tags)];
      if (updates.tags.length !== uniqueTags.length)
        return errorResponse(res, 400, "Tags must be unique.");
      updates.tags = uniqueTags;
    }

    updates.updatedAt = new Date();

    const result = await collections.tasks?.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (result) {
      res.status(200).json({ message: "Task updated", data: result });
    } else {
      errorResponse(res, 500, "Update failed.");
    }
  } catch {
    errorResponse(res, 400, "Invalid update request.");
  }
});

// SECTION - DELETE /tasks/:id
taskRouter.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await collections.tasks?.deleteOne({
      _id: new ObjectId(id),
    });
    if (!result?.deletedCount)
      return errorResponse(res, 404, "Task not found.");
    res.status(200).json({ message: "Task deleted", data: { id } });
  } catch {
    errorResponse(res, 400, "Invalid ID format.");
  }
});
