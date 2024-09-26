import { EventType } from "@prisma/client";

export type CreateEventPayload = {
  emitter: {
    name: string;
  };
  payload: EventType;
  at: string;
};
