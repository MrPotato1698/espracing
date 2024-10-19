import * as t from "drizzle-orm/pg-core"
import { championship } from "./championship"
import { pointsystem } from "./pointsystem"

export const race = t.pgTable('race',
{
  id: t.bigint({ mode: 'number' }).primaryKey(),
  name: t.text(),
  filename: t.text().notNull().unique(),
  championship: t.bigint({mode: 'number'}).default(0).references(() => championship.id),
  orderinchamp: t.bigint({mode: 'number'}).default(0).notNull(),
  pointsystem: t.bigint({mode: 'number'}).references(() => pointsystem.id)

})