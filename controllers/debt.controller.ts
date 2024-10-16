import Debt from "../models/debt.model";
import * as factory from "./handlerFactory";
export const getAllUsers = factory.getAll(Debt, "name");
export const getOneUser = factory.getOne(Debt);
export const createUser = factory.createOne(Debt);
export const updateUser = factory.updateOne(Debt);
export const deleteUser = factory.deleteOne(Debt);
