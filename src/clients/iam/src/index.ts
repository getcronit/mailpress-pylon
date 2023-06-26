import { makeSnekQuery } from "snek-query";
import { Query, Mutation } from "./schema.generated.js";

const apiURL =
  process.env.NODE_ENV === "production"
    ? "http://iam:3000/graphql"
    : "https://services.snek.at/iam/graphql";

export const sq = makeSnekQuery(
  { Query, Mutation },
  {
    apiURL,
  }
);
