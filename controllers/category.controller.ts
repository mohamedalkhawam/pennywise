import Category from "../models/category.model";
import * as factory from "./handlerFactory";

export const getAllUsers = factory.getAll(Category, "name");
export const getOneUser = factory.getOne(Category);
export const createUser = factory.createOne(Category);
export const updateUser = factory.updateOne(Category);
export const deleteUser = factory.deleteOne(Category);
