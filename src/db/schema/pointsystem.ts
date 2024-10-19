import * as t from "drizzle-orm/pg-core"

export const pointsystem = t.pgTable('pointsystem',
{
  id: t.bigint({ mode: 'number' }).primaryKey(),
  name: t.text().notNull().unique(),
  points: t.jsonb().notNull(),
  fastestlap: t.bigint({ mode: 'number' })
})