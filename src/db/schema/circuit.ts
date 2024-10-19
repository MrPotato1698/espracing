import * as t from "drizzle-orm/pg-core"

export const circuit = t.pgTable('circuit', {
  id: t.bigint({ mode: 'number' }).primaryKey(),
  name: t.text(),
  filename: t.text().unique(),
  location: t.text().default("Earth"),
  shortname: t.text()
})