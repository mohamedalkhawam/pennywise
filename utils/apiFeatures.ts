export default class APIFeatures {
  query: any;
  queryString: any;
  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "size", "fields"];
    excludedFields.forEach(el => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const size = this.queryString.size * 1 || 50;
    const skip = (page - 1) * size;
    this.query = this.query.skip(skip).limit(size);
    return this;
  }
  search(searchField: string | undefined) {
    // Check if search parameter exists in query string
    if (this.queryString.search && searchField) {
      if (this.queryString?.search?.length < 3) {
        this.query = [];
      } else {
        const searchTerm = this.queryString.search.trim().toLowerCase();
        const searchRegex = new RegExp(searchTerm, "i"); // 'i' flag for case-insensitive search
        // Build the search query based on the searchField
        const searchQuery = { [searchField]: searchRegex };
        this.query = this.query.find(searchQuery);
      }
    }
    return this;
  }
}
