import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`wealthai-backend listening on port ${env.port}`);
});
