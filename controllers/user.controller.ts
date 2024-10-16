import User from "../models/user.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import * as factory from "./handlerFactory";

const filterObj = (obj: Record<string, string>, ...allowedFields: string[]) => {
  const newObj: Record<string, string> = {};
  Object.keys(obj).forEach((el: string) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
export const updateMe = catchAsync(async (req: any, res: any, next: any) => {
  // 1) Create error if user POSTS password dataBase
  if (req.body.password || req.body.passwordConfirmation) {
    return next(
      new AppError("This route is not for password updates. Please use /updateMyPassword", 400)
    );
  }
  // 2) Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  // 3) Update user document

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});
export const deleteMe = catchAsync(async (req: any, res: any, next: any) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: "success", data: null });
});
export const getMe = (req: any, res: any, next: any) => {
  req.params.id = req.user.id;
  next();
};
export const getAllUsers = factory.getAll(User, "username");
export const getOneUser = factory.getOne(User);
export const createUser = factory.createOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
export async function createDefaultAdminUser() {
  try {
    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      const defaultAdmin = new User({
        fullName: process.env.DEFAULT_USER_FULLNAME,
        role: process.env.DEFAULT_USER_ROLE,
        username: process.env.DEFAULT_USER_USERNAME,
        password: process.env.DEFAULT_USER_PASSWORD,
        passwordConfirmation: process.env.DEFAULT_USER_PASSWORD,
      });

      await defaultAdmin.save();
      console.log("Default admin user created");
    } else {
      console.log("Users collection is not empty, no default admin user created");
    }
  } catch (error) {
    console.error("Error creating default admin user:", error);
  }
}
