// const tours = JSON.parse(
//   fs.readFileSync(
//     `${__dirname}/../dev-data/data/tours-simple.json`,
//     'utf-8'
//   )
// );
// exports.checkID = (req, res, next, val) => {
//   const id = req.params.id * 1;
//   if (id * 1 > tours.length || !id) {
//     return res.status(404).json({
//       status: 'File not found',
//       message: 'Invalid id',
//     });
//   }
//   next();
// };
// exports.checkBody = (req, res, next) => {
//   const data = req.body;
//   if (!data.price || !data.name) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'missing name or price',
//     });
//   }
//   next();
// };
// const removeKeysFromObject = (keysToRemove, obj) => {
//   return Object.keys(obj).reduce((result, key) => {
//     if (!keysToRemove.includes(key)) {
//       result[key] = obj[key];
//     }
//     return result;
//   }, {});
// };
class apiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
    ];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(',')
        .join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
exports.apiFeatures = apiFeatures;
