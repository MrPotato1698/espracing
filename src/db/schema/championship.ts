import * as t from "drizzle-orm/pg-core"

export const championship = t.pgTable('championship', {
  id: t.bigint({ mode: 'number' }).primaryKey(),
  name: t.text(),
  key_search: t.text(),
  year: t.bigint({ mode: 'number' }).notNull().default(0),
  season: t.text().default(""),
  ischampionship: t.boolean().default(false)
})