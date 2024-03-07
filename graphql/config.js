import { createHandler } from "graphql-http/lib/use/express";
import schema from "./schema.js";
import root from "./resolvers.js";

export const graphqlHandler = (req, res, next) =>
  createHandler({
    schema,
    rootValue: root,
    formatError: (err) => {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data || [];
      const message = err.message || "An error occurred.";
      const status = err.originalError.status || 500;
      return { message, status, data };
    },
    context: { req, res, next },
  })(req, res, next);
