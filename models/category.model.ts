// models/Category.ts

import { Schema, model, Document, Types } from "mongoose";

export enum CategoryType {
  Income = "Income",
  Expense = "Expense",
}

export interface ICategory extends Document {
  userId: Types.ObjectId;
  name: string;
  type: CategoryType;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: Object.values(CategoryType), required: true },
  },
  { timestamps: true }
);

const Category = model<ICategory>("Category", CategorySchema);

export default Category;
