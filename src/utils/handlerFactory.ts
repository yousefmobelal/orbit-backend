import type { Model, PopulateOptions, Document } from 'mongoose';
import type { RequestHandler } from 'express';
import ApiFeatures from './apiFeatures';
import { asyncHandler } from './async-handler';
import { HttpError } from './http-error';
import { ResponseStatus } from '@/types/response';

const getModelNameInLowerCase = (Model: Model<any>): string => Model.modelName.toLowerCase();

export const deleteOne = (Model: Model<any>): RequestHandler =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    const modelName = getModelNameInLowerCase(Model);
    if (!doc) {
      return next(new HttpError(`No ${modelName} found with that ID`, 404));
    }
    res.status(204).send();
  });

export const updateOne = (Model: Model<any>): RequestHandler =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    const modelName = getModelNameInLowerCase(Model);

    if (!doc) {
      return next(new HttpError(`No ${modelName} found with that ID`, 404));
    }
    res.status(200).json({ status: ResponseStatus.SUCCESS, data: doc });
  });

export const createOne = (Model: Model<any>): RequestHandler =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: ResponseStatus.SUCCESS,
      data: doc,
    });
  });

export const getOne = (
  Model: Model<any>,
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
      status: ResponseStatus.SUCCESS,
      data: doc,
    });
  });

export const getAll = (
  Model: Model<any>,
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
    const features = new ApiFeatures<any>(Model.find(filter), req.query)
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
      status: ResponseStatus.SUCCESS,
      results: docs.length,
      // This is called envelope
      data: docs,
    });
  });
