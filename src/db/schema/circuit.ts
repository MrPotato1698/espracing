import * as t from "drizzle-orm/pg-core"

export const circuit = t.pgTable('circuit', {
  id: t.bigint("id", { mode: 'number' }).primaryKey(),
  name: t.text("name"),
  filename: t.text("filename").unique(),
  location: t.text("location").default("Earth"),
  shortname: t.text("shortname")
})