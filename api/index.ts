import express from "express";
import md5 from "md5";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

import { EventType } from "@prisma/client";

export type CreateEventPayload = {
  emitter: {
    name: string;
  };
  payload: EventType;
  at: string;
};

const prisma = new PrismaClient();

const app = express();

app.use(express.json());

app.use(cors({ origin: "*" }));

const PORT = 3000;

app.get("/", (req, res) => {
  // Put get data in here
  res.send(`Hello Osinteams :-). To start spying your mates, send requests to POST /api/event with the following payload \`emitter: {
    name: string;
  };
  payload: EventType; // "AVAILABLE" | "DO_NOT_DISTURB" | "AWAY" | "BUSY" | "IN_A_MEETING" | "PRESENTING" | "OFFLINE"
  at: string;
  }\`. Then you can watch the results on dashboard/:user_hash`);
});

// Handler de publication d'un event
app.post("/api/event", async (req, res) => {
  console.log("Payload received:", JSON.stringify(req.body));
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

export default app;
