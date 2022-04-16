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
  if (datamodel.filteredData.length > 1) {
    var sieveTypeSelectorLabel = document.createElement("label");
    sieveTypeSelectorLabel.setAttribute("for", "sieve-type-selector-" + field);
    sieveTypeSelectorLabel.innerHTML = "Filter Type";
    dialog.appendChild(sieveTypeSelectorLabel);
    var sieveTypeSelector = document.createElement("select");
    sieveTypeSelector.setAttribute("id", "sieve-type-selector-" + field);
    sieveTypeSelector.setAttribute("name", "sieve-type-selector-" + field);
    setOptions(sieveTypeSelector, Object.keys(SieveType), required=true);
    dialog.appendChild(sieveTypeSelector);
    
    if (datamodel.types[field] === "number") {
      var inputMin = document.createElement("input");
      inputMin.setAttribute("type", "text");
      inputMin.id = "inputMin";
      inputMin.setAttribute("name", "inputMin");
      inputMin.addEventListener("change", updateNumberSieve);
      if (sieve.sieves[field] && null !== sieve.sieves[field].min && !isNaN(sieve.sieves[field].min)) {
        inputMin.value = sieve.sieves[field].min;
      }
      dialog.appendChild(inputMin);
      dialog.appendChild(document.createTextNode(" to "));
      var inputMax = document.createElement("input");
      inputMax.setAttribute("type", "text");
      inputMax.id = "inputMax";
      inputMax.setAttribute("name", "inputMax");
      inputMax.addEventListener("change", updateNumberSieve);
      if (sieve.sieves[field] && null !== sieve.sieves[field].max && !isNaN(sieve.sieves[field].max)) {
        inputMax.value = sieve.sieves[field].max;
      }
      dialog.appendChild(inputMax);
    } else { // string sieve
      var inputStr = document.createElement("input");
      inputStr.setAttribute("type", "text");
      inputStr.id = "inputStr";
      inputStr.setAttribute("name", "inputStr");
      inputStr.addEventListener("change", updateStringSieve);
      if (sieve.sieves[field] && null !== sieve.sieves[field].max) {
        inputStr.value = sieve.sieves[field].substrs.join(";");
      }
      dialog.appendChild(inputStr);
    }
    var clearlink = document.createElement("a");
    clearlink.innerHTML = "clear";
    clearlink.onclick = clearSieve;
    dialog.appendChild(clearlink);
  }
  // include a button to close the dialog and update the filtering
  var button = document.createElement("button");
  button.setAttribute("type", "button");
  button.innerHTML = "OK";
  button.onclick = closeFilterDialog;
  dialog.appendChild(button);
}
function clearSieve(e) {
  sieve.clear(e.target.parentElement.field);
  closeFilterDialog();
}
function updateNumberSieve(e) {
  var newsieve = new NumberSieve();
  newsieve.setMin(parseFloat(document.getElementById("inputMin").value));
  newsieve.setMax(parseFloat(document.getElementById("inputMax").value));
  //sieve.set(e.target.parentElement.field, newsieve);
}
function updateStringSieve(e) {
  var newsieve = new StringSieve();
  newsieve.set(document.getElementById("inputStr").value.split(";"));
  //sieve.set(e.target.parentElement.field, newsieve);
}
function closeFilterDialog(e) {
  // update the sieve data from the dialog
  var field = e.target.parentElement.field;
  var sieveTypeSelector = document.getElementById("sieve-type-selector-" + field);
  var newSieveConstructor = sieveTypeMap[sieveTypeSelector.value];
  var newsieve = new newSieveConstructor();
  sieve.set(field, newsieve);
  // close the dialog
  var dialog = document.getElementById("filter-dialog");
  dialog.style.visibility = "hidden";
  dialog.style.display = "none";
  // filter and refresh the data
  // TODO see if filter has actually changed before doing this work
  datamodel.filter(sieve.predicate.bind(sieve));
  refresh();
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
  
  // populate the field checkboxes
  var displayFieldsH3 = document.createElement("h3");
  displayFieldsH3.innerHTML = "Display Fields";
  fodiv.appendChild(displayFieldsH3);
  for (let field of result.meta.fields) {
    var input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    var id = "checkbox-" + field;
    input.setAttribute("id", id);
    input.setAttribute("name", id);
    input.setAttribute("value", field);
    input.checked = true;
    input.addEventListener("change", importData.bind(null, result));
    fodiv.appendChild(input);
    var label = document.createElement("label");
    label.setAttribute("for", id);
    label.innerHTML = field;
    fodiv.appendChild(label);
    fodiv.appendChild(document.createElement("br"));
  }
  
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
}
function importData(csvResult) {
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
  mapview.addData(datamodel.filteredData);
  mapview.resetZoom();
  
  // add data to the table
  if (tableview) {
    tableview.clear();
  } else {
    tableview = new TableView("data-table");
  }
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
  
  // set mapview move listener
  mapview.map.on('moveend', function(e) {
    tableview.clear();
  tableview.addHeader(datamodel.keys);
    tableview.addRows(datamodel.filteredData, focus, mapview.boundsPredicate.bind(mapview, datamodel.latfield, datamodel.lonfield));
    });
    
  frameview = new FrameView("preview-frame");
  setUrlField(urlfield.value);
}