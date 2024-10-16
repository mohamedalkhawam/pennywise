import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from "crypto";

const userSchema: Schema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      minlength: [3, "User name must have more than 3 characters"],
      maxlength: [40, "User name must have less or equal than 40 characters"],
      required: [true, "Name is a required field"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Email must be a valid email"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: [true, "Role is a required field"],
    },
    username: {
      type: String,
      trim: true,
      required: [true, "Username is a required field"],
    },
    password: {
      type: String,
      required: [true, "Password is a required field"],
      minlength: [8, "Password must be more or equal than 8 characters"],
      maxlength: [20, "Password must be less or equal than 20 characters"],
      select: false,
    },
    passwordConfirmation: {
      type: String,
      required: [true, "Password confirmation is a required field"],
      minlength: [8, "Password must be more or equal than 8 characters"],
      maxlength: [20, "Password must be less or equal than 20 characters"],
      validate: {
        validator: function (val: any) {
          // @ts-ignore
          return val === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    passwordResetToken: String,
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    trash: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre(/^find/, function (next) {
  this.find({ trush: { $ne: true } });
  next();
});

userSchema.pre("save", async function (next) {
  // this.createdAt = new Date(Date.now());
  // Only run this function if password was actually modified
  if (!this.isModified("password")) {
    return next();
  }

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirmation = undefined;
  next();
});
userSchema.pre("update", async function (next) {
  const update: any = this.getUpdate();
  const tobeUpdated: any = {
    updatedAt: new Date(Date.now()),
  };
  if (update?.password) {
    const hashedPassword = await bcrypt.hash(update.password, 12);
    tobeUpdated.password = hashedPassword;
  }
  this.update({}, { $set: tobeUpdated });

  next();
});

userSchema.methods.correctPassword = async function (
  currentPassword: string,
  userPassword: string
) {
  return await bcrypt.compare(currentPassword, userPassword);
};

userSchema.methods.changePasswordAfter = async function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      // @ts-ignore
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordRestToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  console.log({ resetToken }, { dataBase: this.passwordResetToken });
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
