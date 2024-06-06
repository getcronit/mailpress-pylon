import { makeSnekQuery } from "snek-query";
import { Query, Mutation } from "./schema.generated.js";

// const apiURL =
//   process.env.NODE_ENV === "production"
//     ? "http://mailer:3000/graphql"
//     : "https://services.snek.at/mailer/graphql";

const apiURL = "https://mailer-pylon.cronit.io/graphql";

export const sq = makeSnekQuery(
  { Query, Mutation },
  {
    apiURL,
  }
);
