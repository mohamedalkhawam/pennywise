import catchAsync from "../utils/catchAsync";

export const healthCheck = catchAsync(async (req: any, res: any, next: any) => {
  res.status(200).json({
    status: "success",
  });
});
