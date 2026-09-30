import {
    pgTable,
    text,
    varchar,
    timestamp,
    boolean,
    pgEnum,
    integer,
    uuid
} from 'drizzle-orm/pg-core'

import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod' 

export const FREQUENCY = ["weekly", "daily", "monthly", "yearly"] as const
export const frequencyEnum = pgEnum("frequency", FREQUENCY);
export type FrequencyEnum = (typeof frequencyEnum.enumValues)[number];

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', {length: 60}).notNull().unique(),
    username: varchar('username', {length: 50}).notNull().unique(),
    password: varchar('password').notNull(),
    firstName: varchar('first_name', {length: 50}),
    lastName: varchar('last_name', {length: 50}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})


export const habits = pgTable('habits', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(()=> users.id, {onDelete: 'cascade'}).notNull(),
    name: varchar('name', {length: 100}).notNull(),
    description: text('description'),
    frequency: frequencyEnum('frequency').notNull(),
    targetCount: integer('target_count').default(1),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const entries = pgTable('entries', {
    id: uuid('id').primaryKey().defaultRandom(),
    habitId: uuid('habit_id').references(()=> habits.id, {onDelete: 'cascade'}).notNull(),
    completionDate: timestamp('completion_date').defaultNow().notNull(),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})


export const habitTags = pgTable('habitTags', {
    id: uuid('id').primaryKey().defaultRandom(),
    habitId: uuid('habit_id').references(()=> habits.id, {onDelete: 'cascade'}).notNull(),
    tagId: uuid('tag_id').references(()=> tags.id, {onDelete: 'cascade'}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tags = pgTable('tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', {length: 40}).notNull(),
    color: varchar('color', {length: 40}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const userRelations = relations(users, ({many})=>({
    habits: many(habits)
}))

export const habitsRelations = relations(habits, ({many, one})=>({
    habitTags: many(habitTags),
    user: one(users, {
        fields: [habits.userId],
        references: [users.id]
    }),
    entries: many(entries)
}))

export const entriesRelations = relations(entries, ({one})=>({
    habit: one(habits, {
        fields: [entries.habitId],
        references: [habits.id]
    })
}))

export const tagsRelations = relations(tags, ({many})=>({
    habitTags: many(habitTags)
}))

export const habitsTagsRelations = relations(habitTags, ({one})=>({
    habit: one(habits, {
        fields: [habitTags.habitId],
        references: [habits.id]
    }),
    tag: one(tags, {
        fields: [habitTags.tagId],
        references: [tags.id]
    })
}))


export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type NewHabit = typeof habits.$inferInsert
export type Habit = typeof habits.$inferSelect
export type Entrie = typeof entries.$inferSelect
export type Tag = typeof tags.$inferSelect
export type HabitTag = typeof habitTags.$inferSelect

export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const insertHabitSchema = createInsertSchema(habits)
export const selectHabitSchema = createSelectSchema(habits)

export const insertEntrieSchema = createInsertSchema(entries)
export const selectEntrieSchema = createSelectSchema(entries)

export const insertHabitTagsSchema = createInsertSchema(habitTags)
export const selectHabitTagsSchema = createSelectSchema(habitTags)

export const insertTagSchema = createInsertSchema(tags)
export const selectTagSchema = createSelectSchema(tags)