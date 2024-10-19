import { profiles } from "./profiles"
import * as t from "drizzle-orm/pg-core"

export const message = t.pgTable('message',
{
  id: t.bigint({ mode: 'number' }).primaryKey(),
  name_emissor: t.text().notNull(),
  name_receiver: t.uuid().references(() => profiles.id).default("fd120ba3-e880-4481-a696-e0e0c1b0273d"),
  discord: t.text(),
  region: t.text(),
  description: t.text(),
  readed: t.boolean().default(false)
})