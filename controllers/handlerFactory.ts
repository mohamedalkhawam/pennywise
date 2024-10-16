import APIFeatures from "../utils/apiFeatures";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
// export class HandlerFactory {
//   public Model: any;
//   constructor(Model: any) {
//     this.Model = Model;
//   }
//   public async getAll() {
//     return catchAsync(async (req: any, res: any, next: any) => {
//       let filter: any;
//       if (req.params.tourId) {
//         filter = { tour: req.params.tourId };
//       }
//       const features = new APIFeatures(this.Model.find(filter), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();
//       const data = await features.query;
//       res.status(200).json({
//         status: "success",
//         result: data.length,
//         data: data,
//         requestTime: req.requestTime,
//       });
//     });
//   }
//   public async getOne(popOptions = false) {
//     return catchAsync(async (req: any, res: any, next: any) => {
//       let query = this.Model.findById(req.params.id);
//       if (popOptions) {
//         query.populate(popOptions);
//       }
//       const data = await query;
//       if (!data) {
//         return next(new AppError("No document found with that ID", 404));
//       }
//       res.status(200).json({
//         status: "success",
//         result: 1,
//         data: data,
//         requestTime: req.requestTime,
//       });
//     });
//   }
//   public async createOne() {
//     return catchAsync(async (req: any, res: any, next: any) => {
//       const data = await this.Model.create(req.body);
//       console.log(req.requestTime);
//       res.status(201).json({
//         status: "success",
//         data,
//         requestTime: req.requestTime,
//       });
//     });
//   }
//   public async updateOne() {
//     return catchAsync(async (req: any, res: any, next: any) => {
//       const data = await this.Model.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//       });

//       if (!data) {
//         return next(new AppError("No document found with that ID", 404));
//       }

//       res.status(200).json({
//         status: "success",
//         data,
//         requestTime: req.requestTime,
//       });
//     });
//   }
//   public async deleteOne() {
//     return catchAsync(async (req: any, res: any, next: any) => {
//       const doc = await this.Model.findByIdAndDelete(req.params.id);
//       if (!doc) {
//         return next(new AppError("No document found with that ID", 404));
//       }
//       res.status(204).json({
//         status: "success",
//         data: null,
//         requestTime: req.requestTime,
//       });
//     });
//   }
// }
export const getAll = (
  Model: any,
  searchField: string | undefined = undefined
) =>
  catchAsync(async (req: any, res: any, next: any) => {
    let filter: any = {};

    // Dynamically apply any filters based on request parameters
    if (Object.keys(req.params).length > 0) {
      filter = { ...req.params };
    }

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .search(searchField);
    const data = await features.query;
    const totalResults = await Model.countDocuments();
    res.status(200).json({
      status: "success",
      result: data.length,
      data: data,
      requestTime: req.requestTime,
      totalResults,
    });
  });
export const getOne = (Model: any, popOptions = false) =>
  catchAsync(async (req: any, res: any, next: any) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query.populate(popOptions);
    }
    const data = await query;
    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      result: 1,
      data: data,
      requestTime: req.requestTime,
    });
  });

export const createOne = (Model: any) =>
  catchAsync(async (req: any, res: any, next: any) => {
    const data = await Model.create(req.body);
    console.log(req.requestTime);
    res.status(201).json({
      status: "success",
      data,
      requestTime: req.requestTime,
    });
  });
export const updateOne = (Model: any) =>
  catchAsync(async (req: any, res: any, next: any) => {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data,
      requestTime: req.requestTime,
    });
  });

export const deleteOne = (Model: any) =>
  catchAsync(async (req: any, res: any, next: any) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
      requestTime: req.requestTime,
    });
  });
