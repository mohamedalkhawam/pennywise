import Transaction from "../models/transaction.model";
import * as factory from "./handlerFactory";
export const getAllUsers = factory.getAll(Transaction, "name");
export const getOneUser = factory.getOne(Transaction);
export const createUser = factory.createOne(Transaction);
export const updateUser = factory.updateOne(Transaction);
export const deleteUser = factory.deleteOne(Transaction);
