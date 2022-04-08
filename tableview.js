// Table viewer
function TableView(elementId) {
  this.table = document.getElementById(elementId);
}
TableView.prototype.clear = function() {
  removeAllChildNodes(this.table);
  this.addHeader(this.fields);
}
TableView.prototype.addHeader = function(fields) {
  this.fields = fields;
  var tr = this.table.insertRow(0);
  for (let field of fields) {
    var th = document.createElement('th');
    th.innerHTML = field;
    th.onclick = function(){ sortby(field); };
    tr.appendChild(th);
  }
}
TableView.prototype.addRow = function(row) {
  tr = this.table.insertRow(-1);
  for (let field of this.fields) {
    var td = tr.insertCell(-1);
    td.innerHTML = formatData(row[field]);
  }
  // set row onclick listener
  (function(row) { tr.onclick = function(){
    focus(row);
  }; })(row);
}
TableView.prototype.addRows = function(rows, predicate = function(item) { return true; }) {
  if (null === rows) return;
  for (let row of filter(rows, predicate)) {
    this.addRow(row);
  }
};
TableView.prototype.highlight = function(url) {
  // TODO highlight the selected row
  //for (let tr of this.table.firstElementChild.children) {
  //  console.log(tr);
  //}
};