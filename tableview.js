// Table viewer
function TableView(elementId) {
  this.table = document.getElementById(elementId);
  this.hiddenColumns = ["Area Latitude", "Area Longitude", "URL", "Your Stars", "marker"];
}
TableView.prototype.clear = function() {
  removeAllChildNodes(this.table);
  this.addHeader(this.fields);
}
TableView.prototype.addHeader = function(fields) {
  this.fields = fields;
  var tr = this.table.insertRow(0);
  for (let field of fields) {
    if (this.hiddenColumns.includes(field)) { continue; }
    var th = document.createElement('th');
    th.innerHTML = field;
    var darr = document.createElement('a');
    darr.onclick = function(){ sortby(field); };
    darr.innerHTML = "&darr;";
    th.appendChild(darr);
    var uarr = document.createElement('a');
    uarr.onclick = function(){ sortby(field, asc=false); };
    uarr.innerHTML = "&uarr;";
    th.appendChild(uarr);
    var fbut = document.createElement('a');
    fbut.onclick = function(evt){ openFilterDialog(field, evt); };
    fbut.innerHTML = "F";
    th.appendChild(fbut);
    tr.appendChild(th);
  }
}
TableView.prototype.addRow = function(row, rowaction = function(row) {}) {
  tr = this.table.insertRow(-1);
  for (let field of this.fields) {
    if (this.hiddenColumns.includes(field)) { continue; }
    var td = tr.insertCell(-1);
    td.innerHTML = formatData(row[field]);
  }
  // set row onclick listener
  (function(row) { tr.onclick = function(){
    rowaction(row);
  }; })(row);
}
TableView.prototype.addRows = function(rows, rowaction = function(row) {}, predicate = function(item) { return true; }) {
  if (null === rows) return;
  for (let row of filter(rows, predicate)) {
    this.addRow(row, rowaction);
  }
};
TableView.prototype.highlight = function(url) {
  // TODO highlight the selected row
  //for (let tr of this.table.firstElementChild.children) {
  //  console.log(tr);
  //}
};