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
                    description: "'title' is required and must be a string with at least 3 characters",
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
                }
            },
        },
    };

    await db.command({
        collMod: "tasks",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("tasks", { validator: jsonSchema });
        }
    });
}


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://sirjorgeramirez:J0rg3Mongo$@mean-task-cluster.3y4yku2.mongodb.net/?retryWrites=true&w=majority&appName=mean-task-cluster";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

