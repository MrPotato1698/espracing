import * as t from "drizzle-orm/pg-core"

export const car = t.pgTable('car', {
  id: t.bigint({ mode: 'number' }).primaryKey(),
  filename: t.text().unique(),
  brand: t.text(),
  imgbrand: t.text(),
  model: t.text(),
  year: t.bigint({ mode: 'number' }),
  class: t.text(),
  subclass: t.text(),
  power: t.bigint({ mode: 'number' }),
  torque: t.bigint({ mode: 'number' }),
  weight: t.bigint({ mode: 'number' }),
  description: t.text(),
  tyreTimeChange: t.doublePrecision(),
  fuelLiterTime: t.doublePrecision(),
  maxLiter: t.doublePrecision()
})