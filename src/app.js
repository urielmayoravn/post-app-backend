import express from "express";
import cors from "cors";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pkg from "pg";
import { posts } from "./db/schema.js";
import "dotenv/config";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle({ client: pool });

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  res.status(200).send("Healthy");
});

app.get("/posts", async (req, res) => {
  try {
    const allPosts = await db.select().from(posts);
    res.json(allPosts);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener posts" });
  }
});

app.get("/posts/:id", async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await db.select().from(posts).where(eq(posts.id, postId));

    if (post.length === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json(post[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el post" });
  }
});

app.post("/posts", async (req, res) => {
  try {
    const { title, is_completed } = req.body;

    if (!title) {
      return res.status(400).json({ error: "El título es requerido" });
    }

    const newPost = await db
      .insert(posts)
      .values({
        title,
        is_completed: is_completed ?? false,
      })
      .returning();

    res.status(201).json(newPost[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el post" });
  }
});

app.patch("/posts/:id", async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { is_completed } = req.body;

    const updatedPost = await db
      .update(posts)
      .set({
        ...(is_completed !== undefined && { is_completed }),
      })
      .where(eq(posts.id, postId))
      .returning();

    if (updatedPost.length === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json(updatedPost[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Error al actualizar el post" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const deletedPost = await db
      .delete(posts)
      .where(eq(posts.id, postId))
      .returning();

    if (deletedPost.length === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json({ message: "Post eliminado exitosamente", post: deletedPost[0] });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el post" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
