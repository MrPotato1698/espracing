import * as t from "drizzle-orm/pg-core"

export const team = t.pgTable('team',
{
  id: t.bigint({mode: 'number'}).primaryKey(),
  name: t.text().notNull().notNull().default("basic"),
  image: t.text(),
  description: t.text()
})