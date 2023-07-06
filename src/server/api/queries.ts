import { query$ } from "@prpc/solid";
import { z } from "zod";
  
export const helloQuery = query$({
  queryFn: ({ payload }) => {
    return `server says hello: ${payload.name}`;
  },
  key: "hello",
  schema: z.object({ name: z.string() }),
});
