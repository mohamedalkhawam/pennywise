interface UserDocument extends Document {
  fullName: string;
  role: string;
  userName: string;
  phoneNumber: string;
  password: string;
  branch: string;
  mainBranch: string;
  passwordChangedAt: number;
  trush: boolean;
  correctPassword: (password: string, userPassword: string) => boolean;
  changePasswordAfter: (JWTTimestamp: number) => boolean;
  save: any;
}
