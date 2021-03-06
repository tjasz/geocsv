function focus(row) {
  //mapview.flyTo(row.marker);
  row.marker.openPopup();
  if (datamodel.urlfield) {
    frameview.goTo(row[datamodel.urlfield]);
  }
  tableview.highlight(row.URL);
}
// refresh data in all views; to be called if change to data, filtering, or sorting
function refresh() {
  mapview.clear();
  mapview.addData(datamodel.filteredData);
  mapview.resetZoom();
  
  //frameview.clear();
  
  tableview.clear();
  tableview.addHeader(datamodel.keys);
  tableview.addRows(datamodel.filteredData, focus, mapview.boundsPredicate.bind(mapview, datamodel.latfield, datamodel.lonfield));
}
function sortby(field, asc=true) {
  datamodel.sortBy(field, asc);
  tableview.clear();
  tableview.addHeader(datamodel.keys);
  tableview.addRows(datamodel.filteredData, focus, mapview.boundsPredicate.bind(mapview, datamodel.latfield, datamodel.lonfield));
}
function openFilterDialog(field, evt) {
  // make the dialog visible at the mouse location
  var dialog = document.getElementById("filter-dialog");
  dialog.field = field;
  removeAllChildNodes(dialog);
  dialog.style.visibility = "visible";
  dialog.style.display = "block";
  dialog.style.left = Math.min($(document).width() - 304, evt.pageX) + "px";
  dialog.style.top = (evt.pageY + 20) + "px";
  // put the fieldname as a header
  var fieldname = document.createElement("h3");
  fieldname.innerHTML = field;
  dialog.appendChild(fieldname);
  // add filter options
  // create selector for sieve type (and label for selector)
  var sieveTypeSelectorLabel = document.createElement("label");
  sieveTypeSelectorLabel.setAttribute("for", "sieve-type-selector-" + field);
  sieveTypeSelectorLabel.innerHTML = "Filter Type";
  dialog.appendChild(sieveTypeSelectorLabel);
  var sieveTypeSelector = document.createElement("select");
  sieveTypeSelector.setAttribute("id", "sieve-type-selector-" + field);
  sieveTypeSelector.setAttribute("name", "sieve-type-selector-" + field);
  setOptions(sieveTypeSelector, Object.keys(SieveType), required=true);
  sieveTypeSelector.addEventListener("change", function(e) { populateParamInputs(e.target); });
  dialog.appendChild(sieveTypeSelector);
  // add a div where the parameter inputs will go
  var paramInputsDiv = document.createElement("div");
  paramInputsDiv.id = "param-inputs-div";
  dialog.appendChild(paramInputsDiv);
  // set the values to current sieve settings
  if (sieve.sieves[field]) {
    var classname = sieve.sieves[field].constructor.name;
    sieveTypeSelector.value = classname.substring(0, classname.length - 5);
    populateParamInputs(sieveTypeSelector);
  }
  // include a button to close the dialog and update the filtering
  var button = document.createElement("button");
  button.setAttribute("type", "button");
  button.innerHTML = "OK";
  button.onclick = closeFilterDialog;
  dialog.appendChild(button);
}
// create input boxes for each parameter associated with sieve type
function populateParamInputs(sieveTypeSelector) {
  var field = sieveTypeSelector.parentElement.field;
  var sieveType = sieveTypeSelector.value;
  var params = sieveParamsMap[sieveType];
  var paramsInputDiv = document.getElementById("param-inputs-div");
  removeAllChildNodes(paramsInputDiv);
  for (let param of params) {
    var label = document.createElement("label");
    label.setAttribute("for", sieveType + "-" + param);
    label.innerHTML = param;
    paramsInputDiv.appendChild(label);
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.id = sieveType + "-" + param;
    input.setAttribute("name", sieveType + "-" + param);
    if (sieve.sieves[field] && null !== sieve.sieves[field][param]) {
      input.value = sieve.sieves[field][param];
    }
    paramsInputDiv.appendChild(input);
  }
}
function closeFilterDialog(e) {
  // update the sieve type from the dialog
  var field = e.target.parentElement.field;
  var sieveTypeSelector = document.getElementById("sieve-type-selector-" + field);
  var newSieveConstructor = sieveTypeMap[sieveTypeSelector.value];
  // update the sieve parameters from the dialog
  var params = {};
  for (let param of sieveParamsMap[sieveTypeSelector.value]) {
    var input = document.getElementById(sieveTypeSelector.value + "-" + param);
    params[param] = input.value;
  }
  var newsieve = new newSieveConstructor(params);
  // check for changes to the sieve
  if (!sieve.sieves[field] || !sievesEqual(newsieve, sieve.sieves[field])) {
    // update
    sieve.set(field, newsieve);
    // filter and refresh the data
    datamodel.filter(sieve.predicate.bind(sieve));
    refresh();
  }
  // close the dialog
  var dialog = document.getElementById("filter-dialog");
  dialog.style.visibility = "hidden";
  dialog.style.display = "none";
}
function clearSieve() {
  sieve.clear();
  datamodel.filter(item => true);
  refresh();
}
function openColumnSelectDialog(evt) {
  // make the dialog visible at the mouse location
  var dialog = document.getElementById("column-select-dialog");
  removeAllChildNodes(dialog);
  dialog.style.visibility = "visible";
  dialog.style.display = "block";
  dialog.style.left = Math.min($(document).width() - 304, evt.pageX) + "px";
  dialog.style.top = (evt.pageY + 20) + "px";
  // put a header
  var displayFieldsH3 = document.createElement("h3");
  displayFieldsH3.innerHTML = "Visible Fields";
  dialog.appendChild(displayFieldsH3);

  // populate the field checkboxes
  for (let field of datamodel.keys) {
    var input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    var id = "checkbox-" + field;
    input.setAttribute("id", id);
    input.setAttribute("name", id);
    input.setAttribute("value", field);
    input.checked = !tableview.hiddenColumns.includes(field);
    dialog.appendChild(input);
    var label = document.createElement("label");
    label.setAttribute("for", id);
    label.innerHTML = field;
    dialog.appendChild(label);
    dialog.appendChild(document.createElement("br"));
  }

  // include a button to close the dialog and update the filtering
  var button = document.createElement("button");
  button.setAttribute("type", "button");
  button.innerHTML = "OK";
  button.onclick = closeColumnSelectDialog;
  dialog.appendChild(button);
}
function closeColumnSelectDialog() {
  // update the table view
  tableview.clear();
  // hide fields based on checkboxes
  tableview.hiddenColumns = [];
  for (let field of datamodel.keys) {
    var cb = document.getElementById("checkbox-" + field);
    if (!cb.checked) {
      tableview.hiddenColumns.push(field);
    }
  }
  tableview.addHeader(datamodel.keys);
  tableview.addRows(datamodel.filteredData, focus, mapview.boundsPredicate.bind(mapview, datamodel.latfield, datamodel.lonfield));
  // close the dialog
  var dialog = document.getElementById("column-select-dialog");
  dialog.style.visibility = "hidden";
  dialog.style.display = "none";
}

const fileSelector = document.getElementById('file-selector');
const delimText = document.getElementById('delim-text');
const nextButton = document.getElementById('next-button');
fileSelector.addEventListener('change', (event) => {
    const fileList = fileSelector.files;
    readFile(fileList[0], delimText.value[0]);
  });
nextButton.addEventListener('click', (event) => {
    const fileList = fileSelector.files;
    readFile(fileList[0], delimText.value[0]);
  });
function readFile(fname, delim) {
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    setupFieldOptions(event.target.result, delim);
  });
  reader.readAsText(fname);
}

var mapview;
var frameview;
var tableview;
var sieve;
var datamodel;

function setupFieldOptions(csvString, delimiter=",") {
  var fodiv = document.getElementById("field-options");
  fodiv.style.display = "block";
  // Use PapaParse to convert string to array of objects
  var result = Papa.parse(csvString, {delimiter: delimiter, header: true, dynamicTyping: false, skipEmptyLines: true});
  
  // put the data in a datamodel
  datamodel = new DataModel(result.data);
  
  // populate the field dropdowns with options
  var latfield = document.getElementById("latfield");
  var lonfield = document.getElementById("lonfield");
  var titlefield = document.getElementById("titlefield");
  var urlfield = document.getElementById("urlfield");
  setOptions(latfield, result.meta.fields, required=true, findText="lat");
  setOptions(lonfield, result.meta.fields, required=true, findText="lon");
  setOptions(titlefield, result.meta.fields, required=true);
  setOptions(urlfield, result.meta.fields, required=false, findText="url");
  latfield.addEventListener("change", importData.bind(null, result));
  lonfield.addEventListener("change", importData.bind(null, result));
  titlefield.addEventListener("change", importData.bind(null, result));
  urlfield.addEventListener("change", function(e) { setUrlField(e.target.value); });
  // populate the display field dropdowns with options
  var sizefield = document.getElementById("sizefield");
  var shapefield = document.getElementById("shapefield");
  var huefield = document.getElementById("huefield");
  var saturfield = document.getElementById("saturfield");
  var lightfield = document.getElementById("lightfield");
  var alphafield = document.getElementById("alphafield");
  var isnumeric = function(key) { return datamodel.types[key] === "number"; };
  setOptions(sizefield, filter(result.meta.fields, isnumeric), required=false);
  setOptions(shapefield, filter(result.meta.fields, isnumeric), required=false);
  setOptions(huefield, filter(result.meta.fields, isnumeric), required=false);
  setOptions(saturfield, filter(result.meta.fields, isnumeric), required=false);
  setOptions(lightfield, filter(result.meta.fields, isnumeric), required=false);
  setOptions(alphafield, filter(result.meta.fields, isnumeric), required=false);
  sizefield.addEventListener("change", importData.bind(null, result));
  shapefield.addEventListener("change", importData.bind(null, result));
  huefield.addEventListener("change", importData.bind(null, result));
  saturfield.addEventListener("change", importData.bind(null, result));
  lightfield.addEventListener("change", importData.bind(null, result));
  alphafield.addEventListener("change", importData.bind(null, result));
  
  importData(result);
}
function setUrlField(fieldname) {
  // Adjust width of top area based on urlfield.
  // Show both map and frame if URL is set. Show just map otherwise.
  datamodel.urlfield = fieldname;
  var previewdiv = document.getElementById("preview");
  var leafletcontainer = document.getElementsByClassName("leaflet-container")[0];
  if (datamodel.urlfield) {
    previewdiv.style.display = "inline";
    leafletcontainer.style.width = "50%";
  } else {
    previewdiv.style.display = "none";
    leafletcontainer.style.width = "100%";
  }
  mapview.map.invalidateSize();
}
function importData(csvResult) {
  document.getElementById("getting-started").style.display = "none";
  // if latfield, lonfield, or titlefield change:
  // update the map markers
  if (datamodel.latfield !== latfield.value ||
      datamodel.lonfield !== lonfield.value ||
      datamodel.titlefield !== titlefield.value) {
    datamodel.latfield = latfield.value;
    datamodel.lonfield = lonfield.value;
    datamodel.titlefield = titlefield.value;
    // associate markers with each data row/object
    datamodel.addMarkers();
  }
  
  // filter the data in the data model
  if (sieve) {
    sieve.clear();
  } else {
    sieve = new FieldSieve();
  }
  datamodel.filter(sieve.predicate.bind(sieve));
  
  // add data to the map
  if (mapview) {
    mapview.clear();
  } else {
    mapview = new MapView();
  }
  // set map display settings
  mapview.sizefield = sizefield.value;
  mapview.shapefield = shapefield.value;
  mapview.huefield = huefield.value;
  mapview.saturfield = saturfield.value;
  mapview.lightfield = lightfield.value;
  mapview.alphafield = alphafield.value;
  // add data
  mapview.addData(datamodel.filteredData);
  mapview.resetZoom();
  
  // add data to the table
  if (tableview) {
    tableview.clear();
  } else {
    tableview = new TableView("data-table");
  }
  tableview.addHeader(datamodel.keys);
  tableview.addRows(datamodel.filteredData, focus, mapview.boundsPredicate.bind(mapview, datamodel.latfield, datamodel.lonfield));
  document.getElementById("table").style.display = "block";
  document.getElementById("openColumnSelectDialog").addEventListener("click", openColumnSelectDialog);
  
  // set mapview move listener
  mapview.map.on('moveend', function(e) {
    tableview.clear();
  tableview.addHeader(datamodel.keys);
    tableview.addRows(datamodel.filteredData, focus, mapview.boundsPredicate.bind(mapview, datamodel.latfield, datamodel.lonfield));
    });
    
  frameview = new FrameView("preview-frame");
  setUrlField(urlfield.value);
}