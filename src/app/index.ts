import express from "express";
import md5 from "md5";
import { PrismaClient } from "@prisma/client";
import { CreateEventPayload } from "./types";

const prisma = new PrismaClient();

const app = express();

app.use(express.json());

const PORT = 3000;

app.get("/api", (req, res) => {
  // Put get data in here
  res.send("Hello Osinteams :-)");
});

// Handler de publication d'un event
app.post("/api/event", async (req, res) => {
  try {
    const { emitter, payload }: CreateEventPayload = req.body;
    const hash = md5(emitter.name);

    const user = await prisma.user.upsert({
      where: {
        hash,
      },
      create: {
        hash,
        name: emitter.name,
      },
      update: {},
    });

    const newEvent = await prisma.event.create({
      data: {
        type: payload,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: { user: true },
    });
    res.json({ code: 200, event: newEvent });
  } catch (e) {
    console.error(e);
    res.json({ code: 500, event: null });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
