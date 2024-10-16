import { promisify } from "util";
import User from "../models/user.model";
import catchAsync from "../utils/catchAsync";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError";
// import sendEmail from "../utils/email";
import crypto from "crypto";
const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user: any, statusCode: number, res: any, req: any) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      // @ts-ignore
      Date.now() + process.env.JWT_COOKIE_EXPIRED_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure: req.secrure,
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
    requestTime: req.requestTime,
  });
};
export const signup = catchAsync(async (req: any, res: any, next: any) => {
  const newUser = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
  });
  // try {
  //   const message = `Forgot your password? Submit a PATCH with your new password and passwordConfirmation`;
  //   await sendEmail({
  //     email: req.body.email,
  //     subject: "Your password reset token (valid for 10 min)",
  //     message,
  //   });
  // } catch (error) {}
  createSendToken(newUser, 201, res, req);
});
export const signin = catchAsync(async (req: any, res: any, next: any) => {
  const { username, password } = req.body;
  // 1)- Check of username and password are exist
  if (!username || !password) {
    return next(
      new AppError(
        "Please provide username and password!!",
        400,
        1,
        "validation"
      )
    );
  }
  // 2)- Check if user exists && password is correct
  //sence we stopped the password from being selected with getting user Data, to get it back just in this case i add the select(+the property name )
  const user = await User.findOne({ username }).select("+password");
  // @ts-ignore
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect username or password", 401, 2, "Auth"));
  }
  //   console.log(user);
  // 3)- If everything ok, send token to client
  createSendToken(user, 200, res, req);
});

export const protect = catchAsync(async (req: any, res: any, next: any) => {
  let token: any;
  // 1) Getting the token and check of it's there
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (req.headers.token) {
    token = req.headers.token;
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // 2) Verification token
  const decoded: any = await promisify(jwt.verify)(
    token,
    // @ts-ignore
    process.env.JWT_SECRET as jwt.Secret
  );
  console.log(decoded);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  // 4) Check if user changed password after the token was issued
  // @ts-ignore
  if (await currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }
  // Grant access to protected route
  req.user = currentUser;
  next();
});
export const restrictTo = (...roles: any) => {
  return (req: any, res: any, next: any) => {
    //i could get the user role from user object because the protect function  is running before this function, and in the protect function i said that re.user = currentUser so i have access to the user object
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
export const forgotPassword = catchAsync(
  async (req: any, res: any, next: any) => {
    // 1) Get user by posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError("There is no user with email address", 400));
    }
    // 2) Generate new token
    // @ts-ignore
    const resetToken = user.createPasswordRestToken();
    await user.save({ validateBeforeSave: false });
    // 3) send it back to user's email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH with your new password and passwordConfirmation
   to:${resetURL}. \n If you did not forget your password, please ignore this email!`;
    try {
      // await sendEmail({
      //   email: user.email,
      //   subject: "Your password reset token (valid for 10 min)",
      //   message,
      // });
      res.status(200).json({
        status: "success",
        message: "Token send to email!",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          "There was an error sending the email, Try again later!!",
          500
        )
      );
    }
  }
);

export const resetPassword = catchAsync(
  async (req: any, res: any, next: any) => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      console.log(user);
      return next(new AppError("Token is invalid or has expired", 400));
    }
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(user, 200, res, req);
    // 3) Update changedPasswordAt property for user
    // 4) Log the user in, send jwt
  }
);
export const updateUserPassword = catchAsync(
  async (req: any, res: any, next: any) => {
    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    await user.save();
    createSendToken(user, 200, res, req);
  }
);
export const updateMyPassword = catchAsync(
  async (req: any, res: any, next: any) => {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }
    if (
      !(await user.correctPassword(
        req.body.currentPassword ?? "",
        user.password
      ))
    ) {
      return next(new AppError("Your current password is wrong", 401));
    }
    //   console.log(user);
    // 3)- If everything ok, send token to client
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    await user.save();
    createSendToken(user, 200, res, req);
    // 1) Get user from collection
    // 2) Check if POSTED current password is currect
    // 3) if so, update password
    // 4) log user in, send jwt
  }
);
