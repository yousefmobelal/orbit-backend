import type { Query } from 'mongoose';
import type { ParsedQs } from 'qs';

class ApiFeatures<T> {
  query: Query<T[], T>;
  queryParams: ParsedQs;

  constructor(query: Query<T[], T>, queryParams: ParsedQs) {
    this.query = query;
    this.queryParams = queryParams;
  }

  filter(): this {
    const queryObj = { ...this.queryParams };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const query = JSON.parse(queryStr);
    Object.keys(query).forEach((key) => {
      const value = query[key];
      const isNotNumber = Number.isNaN(parseFloat(value)) || !Number.isFinite(parseFloat(value));
      if (typeof value === 'string' && isNotNumber) {
        query[key] = new RegExp(value, 'i');
      }
    });
    this.query = this.query.find(query);

    return this;
  }

  sort(): this {
    if (this.queryParams.sort) {
      const sortBy = (this.queryParams.sort as string).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields(): this {
    if (this.queryParams.fields) {
      const fields = (this.queryParams.fields as string).split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate(): this {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
export default ApiFeatures;
