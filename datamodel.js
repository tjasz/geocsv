function DataModel(data) {
  this.data = data;
  this.predicate = function(item) { return true; };
  this.filteredData = data;
  this.keys = Object.keys(data[0]);
  // get the type info for each column
  // just number or string
  this.types = {};
  for (let item of data) {
    for (let key of this.keys) {
      if (!this.types[key]) {
        this.types[key] = isNaN(Number(item[key])) ? "string" : "number";
      } else {
        if (this.types[key] != "number" || isNaN(Number(item[key]))) {
          this.types[key] = "string";
        }
      }
    }
  }
}
DataModel.prototype.getComparator = function(field) {
  return function(a, b) {
    if ("number" == this.types[field]) {
      var va = Number(a[field]);
      var vb = Number(b[field]);
      return va - vb;
    } else {
      return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
    }
  };
};
DataModel.prototype.sortBy = function(field) {
  this.filteredData.sort(this.getComparator(field).bind(this));
};
DataModel.prototype.filter = function(predicate) {
  this.predicate = predicate;
  this.filteredData = [];
  for (let item of filter(this.data, this.predicate)) {
    this.filteredData.push(item);
  }
};