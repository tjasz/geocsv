function DataModel(data) {
  this.data = data;
  this.predicate = function(item) { return true; };
  this.filteredData = data;
  this.keys = Object.keys(data[0]);
  this.getFieldTypes();
  // field options
  this.latfield = null;
  this.lonfield = null;
  this.titlefield = null;
  this.urlfield = null;
}
DataModel.prototype.getFieldTypes = function() {
  // get the type info for each column
  // just number or string
  this.types = {};
  for (let item of this.data) {
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
};
DataModel.prototype.getComparator = function(field, asc=true) {
  return function(a, b) {
    if ("number" == this.types[field]) {
      var va = Number(a[field]);
      var vb = Number(b[field]);
      result = va - vb;
    } else {
      result = a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
    }
    return result * (asc ? 1 : -1);
  };
};
DataModel.prototype.sortBy = function(field, asc=true) {
  this.filteredData.sort(this.getComparator(field, asc).bind(this));
};
DataModel.prototype.filter = function(predicate) {
  if (this.predicate !== predicate) {
    this.predicate = predicate;
    this.filteredData = [];
    for (let item of filter(this.data, this.predicate)) {
      this.filteredData.push(item);
    }
  }
};
const svgIcon = L.divIcon({
  html: `
<svg
  width="40"
  height="40"
  viewBox="-100 -100 200 200"
  version="1.1"
  preserveAspectRatio="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M0 0 L50 100 L100 0 Z" fill="#7A8BE7"></path>
</svg>`,
  className: "svg-icon",
  iconSize: [40, 40],
  iconAnchor: [20,20],
});
// associate a Leaflet marker with a data row/object
DataModel.prototype.addMarker = function(item) {
  if (!this.latfield || !this.keys.includes(this.latfield)) {
    throw "latfield not in data";
  }
  if (!this.lonfield || !this.keys.includes(this.lonfield)) {
    throw "lonfield not in data";
  }
  // build the marker
  if (this.titlefield && this.keys.includes(this.titlefield)) {
    var title = item[this.titlefield];
    var popup = item[this.titlefield];
  }
  var lat = toDegrees(item[this.latfield]);
  var lon = toDegrees(item[this.lonfield]);
  if (lat !== null && lon !== null) {
    var marker = L.marker([lat, lon], {
      opacity: 1,
      title: title,
      icon: svgIcon
    }).bindPopup(popup);
  } else {
    marker = null;
  }
  // add it to the object
  item.marker = marker;
}
// add markers to the CSV objects
DataModel.prototype.addMarkers = function() {
  // For each row in data, create a marker and add it to the row/object
  for (var i in this.data) {
    var row = this.data[i];
    this.addMarker(row);
  }
}