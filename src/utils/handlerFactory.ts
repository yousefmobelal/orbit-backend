import type { Model, PopulateOptions, Document } from 'mongoose';
import type { RequestHandler } from 'express';
import ApiFeatures from './apiFeatures';
import { asyncHandler } from './async-handler';
import { HttpError } from './http-error';

const getModelNameInLowerCase = (Model: Model<any>): string => Model.modelName.toLowerCase();

export const deleteOne = <T extends Document>(Model: Model<T>): RequestHandler =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    const modelName = getModelNameInLowerCase(Model);
    if (!doc) {
      return next(new HttpError(`No ${modelName} found with that ID`, 404));
    }
    res.status(204).json({ status: 'success', data: null });
  });

export const updateOne = <T extends Document>(Model: Model<T>): RequestHandler =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    const modelName = getModelNameInLowerCase(Model);

    if (!doc) {
      return next(new HttpError(`No ${modelName} found with that ID`, 404));
    }
    res.status(200).json({ status: 'success', data: doc });
  });

export const createOne = <T extends Document>(Model: Model<T>): RequestHandler =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

export const getOne = <T extends Document>(
  Model: Model<T>,
  populateOptions?: PopulateOptions | PopulateOptions[],
): RequestHandler =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // Here we have query
    let query = Model.findById(id).select('-__v');

    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;

    const modelName = getModelNameInLowerCase(Model);
    if (!doc) {
      return next(new HttpError(`No ${modelName} found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

export const getAll = <T extends Document>(
  Model: Model<T>,
  populateOptions?: PopulateOptions | PopulateOptions[] | null,
  nestedFilter: Record<string, string> = {},
): RequestHandler =>
  asyncHandler(async (req, res, next) => {
    const filter: Record<string, any> = {};
    Object.entries(nestedFilter || {}).forEach(([paramName, fieldName]) => {
      if (req.params && req.params[paramName]) {
        filter[fieldName] = req.params[paramName];
      }
    });
    //EXECUTE QUERY
    const features = new ApiFeatures<T>(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const docs = await features.query.explain();
    let { query } = features;
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const docs = await query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      // This is called envelope
      data: docs,
    });
  });
