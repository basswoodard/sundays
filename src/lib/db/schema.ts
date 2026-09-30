import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  bio: text("bio").notNull().default(""),
  country: text("country").notNull().default(""),
  dob: text("dob").notNull().default(""),
  avatarUrl: text("avatar_url").notNull().default(""),

  dietaries: text("dietaries").notNull().default("[]"),
  allergies: text("allergies").notNull().default("[]"),

  restaurantName: text("restaurant_name").notNull().default(""),
  yearsExperience: text("years_experience").notNull().default(""),
  school: text("school").notNull().default(""),
  qualificationYear: text("qualification_year").notNull().default(""),

  phone: text("phone").notNull().default(""),
  phoneVisible: integer("phone_visible", { mode: "boolean" }).notNull().default(false),
  instagram: text("instagram").notNull().default(""),
  instagramVisible: integer("instagram_visible", { mode: "boolean" }).notNull().default(false),

  paymentMethod: text("payment_method").notNull().default("Cash"),
  paymentDetails: text("payment_details").notNull().default(""),

  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const suppers = sqliteTable("suppers", {
  id: text("id").primaryKey(),
  hostId: text("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  location: text("location").notNull(),
  date: text("date").notNull(), // ISO date, e.g. 2026-10-05
  time: text("time").notNull().default("18:00"),
  guestTotal: integer("guest_total").notNull().default(6),
  visibility: text("visibility").notNull().default("public"), // public | private
  cuisine: text("cuisine").notNull().default(""),
  description: text("description").notNull().default(""),
  recurring: integer("recurring", { mode: "boolean" }).notNull().default(false),

  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  supperId: text("supper_id").notNull().references(() => suppers.id, { onDelete: "cascade" }),
  guestId: text("guest_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  status: text("status").notNull().default("requested"), // requested | booked
  paymentStatus: text("payment_status"), // null | unpaid | awaiting_verification | paid
  paymentDescription: text("payment_description").notNull().default(""),

  dietaries: text("dietaries").notNull().default("[]"),
  allergies: text("allergies").notNull().default("[]"),
  note: text("note").notNull().default(""),

  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});
