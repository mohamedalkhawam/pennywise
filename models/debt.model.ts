// models/Debt.ts

import { Schema, model, Document, Types } from "mongoose";

export enum DebtType {
  OwedToUser = "OwedToUser",
  OwedByUser = "OwedByUser",
}

export enum DebtStatus {
  Pending = "Pending",
  Paid = "Paid",
}

export interface IDebt extends Document {
  name: string;
  userId: Types.ObjectId;
  type: DebtType;
  amount: number;
  party: string;
  dueDate: Date;
  status: DebtStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DebtSchema = new Schema<IDebt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: Object.values(DebtType), required: true },
    name: { type: String, trim: true, required: true },
    amount: { type: Number, required: true },
    party: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(DebtStatus),
      default: DebtStatus.Pending,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Debt = model<IDebt>("Debt", DebtSchema);

export default Debt;
