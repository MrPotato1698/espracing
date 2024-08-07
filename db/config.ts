import { defineDb, column, defineTable } from 'astro:db';

const Role = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
  }
})

const Team = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    image: column.text(),
    description: column.text(),
  }
})

const User = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text(),
    password: column.text(),
    name: column.text(),
    steam_id: column.number({ optional: true }),
    image: column.text(),
    races: column.number(),
    poles: column.number(),
    wins: column.number(),
    flaps: column.number(),
    podiums: column.number(),
    top5: column.number(),
    top10: column.number(),
    dnf: column.number(),
    role: column.number({ references: () => Role.columns.id }),
    team: column.number({ references: () => Team.columns.id, optional: true }),
  }
})

const Message = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name_emissor: column.text(),
    name_receiver: column.number({ references: () => User.columns.id }),
    discord: column.text(),
    region: column.text(),
    description: column.text(),
    readed: column.boolean(),
  }
})

const Inscription = defineTable({
  columns:{
    id: column.number({ primaryKey: true }),
    race: column.text(),
    user: column.number({ references: () => User.columns.id }),
    valid_laps: column.number(),
    position: column.number(),
  }
})

const Championship = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    keysearch: column.text(),
  }
})

const Race = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    filename: column.text(),
    champ: column.number({ references: () => Championship.columns.id }),
  }
})

const Car = defineTable({
  columns:{
    id: column.number({ primaryKey: true }),
    filename: column.text(),
    brand: column.text(),
    imgbrand: column.text(),
    model: column.text(),
    year: column.number(),
    class: column.text(),
    power: column.number(),
    torque: column.number(),
    weight: column.number(),
    description: column.text({ optional: true }),
  }
})

const Circuit = defineTable({
  columns:{
    id: column.number({ primaryKey: true }),
    name: column.text(),
    filename: column.text(),
    location: column.text(),
  }
})

const CircuitLayout = defineTable({
  columns:{
    id: column.number({ primaryKey: true }),
    name: column.text(),
    filename: column.text(),
    circuit: column.number({ references: () => Circuit.columns.id }),
    length: column.number(),
    capacity: column.number(),
  }
})

// https://astro.build/db/config
export default defineDb({
  tables: {
    Role,
    Team,
    User,
    Message,
    Inscription,
    Championship,
    Race,
    Car,
    Circuit,
    CircuitLayout,
  }
});
