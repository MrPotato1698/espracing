import * as t from "drizzle-orm/pg-core"
import { profiles } from "./profiles"

export const inscriptions = t.pgTable('inscriptions',
  {
    id: t.bigint({ mode: 'number' }).primaryKey(),
    race: t.text(),
    profile: t.uuid().references(() => profiles.id),
    valid_laps: t.text().default("0"),
    position: t.text().default("1")
  })