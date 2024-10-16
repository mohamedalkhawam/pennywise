// models/Transaction.ts

import { Schema, model, Document, Types } from "mongoose";

export enum TransactionType {
  Income = "Income",
  Expense = "Expense",
}

export interface ITransaction extends Document {
  name: string;
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  date: Date;
  category?: string;
  party?: string;
  isRecurring: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, required: true },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, trim: true },
    party: { type: String, trim: true },
    isRecurring: { type: Boolean, default: false },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Transaction = model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
