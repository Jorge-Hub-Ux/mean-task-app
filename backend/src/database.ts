import * as mongodb from "mongodb";
import { Task } from "./task";

// Global object to hold references to MongoDB collections
export const collections: {
  tasks?: mongodb.Collection<Task>;
} = {};

// Connects to MongoDB and initializes the 'tasks' collection with schema validation
export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();

  const db = client.db("mean-task-app");
  await applySchemaValidation(db);

  const tasksCollection = db.collection<Task>("tasks");
  collections.tasks = tasksCollection;

  // Create indexes to optimize search
  await tasksCollection.createIndex({ dueDate: 1 });
  await tasksCollection.createIndex({ status: 1 });
}

// Applies JSON schema validation rules to the tasks collection to ensure consistent structure
async function applySchemaValidation(db: mongodb.Db) {
  const jsonSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "status", "dueDate"],
      additionalProperties: false,
      properties: {
        _id: {},
        title: {
          bsonType: "string",
          minLength: 3,
          description:
            "'title' is required and must be a string with at least 3 characters",
        },
        description: {
          bsonType: "string",
          maxLength: 500,
          description: "optional string with max 500 characters",
        },
        status: {
          bsonType: "string",
          enum: ["Pending", "In Progress", "Completed"],
          description: "'status' must be one of the allowed values",
        },
        priority: {
          bsonType: "string",
          enum: ["Low", "Medium", "High"],
          description: "optional enum value",
        },
        dueDate: {
          bsonType: "date",
          description: "'dueDate' is required and must be a future date",
        },
        tags: {
          bsonType: "array",
          uniqueItems: true,
          items: {
            bsonType: "string",
          },
          description: "optional array of unique strings",
        },
        createdAt: {
          bsonType: "date",
        },
        updatedAt: {
          bsonType: "date",
        },
        history: {
          bsonType: "array",
          description: "Array of changes with timestamps",
          items: {
            bsonType: "object",
            required: ["changedAt", "changes"],
            properties: {
              changedAt: { bsonType: "date" },
              changes: {
                bsonType: "array",
                items: { bsonType: "string" },
              },
            },
          },
        },
      },
    },
  };

  await db
    .command({
      collMod: "tasks",
      validator: jsonSchema,
    })
    .catch(async (error: mongodb.MongoServerError) => {
      if (error.codeName === "NamespaceNotFound") {
        await db.createCollection("tasks", { validator: jsonSchema });
      }
    });
}
