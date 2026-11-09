import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db('wanderlast');

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt(),
  ],
  session: {
    // NOTE: `cookieCache` must stay OFF in this better-auth version: enabling
    // it stops the `session_token` cookie from being issued on sign-in while
    // the session route still requires it — auth breaks for fresh logins.
    // JWT *access tokens* come from the `jwt()` plugin above.
  }
});