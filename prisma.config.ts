import { defineConfig, env } from "prisma/config";
const dotenv = require("dotenv");

dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
