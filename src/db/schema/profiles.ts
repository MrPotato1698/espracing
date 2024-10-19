import * as t from "drizzle-orm/pg-core"
import { team } from "./team"

export const profiles = t.pgTable('profiles',
{
  id: t.uuid().primaryKey(),
  email: t.text().unique(),
  full_name: t.text(),
  avatar: t.text().default(""),
  steam_id: t.text().default("").unique(),
  races: t.bigint({ mode: 'number' }).default(0),
  poles: t.bigint({ mode: 'number' }).default(0),
  wins: t.bigint({ mode: 'number' }).default(0),
  flaps: t.bigint({ mode: 'number' }).default(0),
  podiums: t.bigint({ mode: 'number' }).default(0),
  top5: t.bigint({ mode: 'number' }).default(0),
  top10: t.bigint({ mode: 'number' }).default(0),
  dnf: t.bigint({ mode: 'number' }).default(0),
  roleesp: t.text(),
  is_team_manager: t.boolean().default(false),
  team: t.bigint({ mode: 'number' }).references(() => team.id),
  updated_at: t.timestamp(),
  numberplate: t.bigint({ mode: 'number' }).default(0)
})