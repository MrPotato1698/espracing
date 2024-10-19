import * as t from "drizzle-orm/pg-core"
import {circuit} from "./circuit"

export const circuitLayout = t.pgTable('circuitLayout',
{
  id: t.bigint({ mode: 'number' }).primaryKey(),
  name: t.text(),
  filename: t.text(),
  circuit: t.bigint({ mode: 'number' }).notNull().references(() => circuit.id),
  length: t.bigint({ mode: 'number' }).default(1),
  capacity: t.bigint({ mode: 'number' }).default(0)
})