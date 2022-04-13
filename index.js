function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function formatData(data) {
  // if null, return empty string
  if (null === data) return "";
  // if a number, return its repr
  if (typeof data === 'number') {
    return data;
  }
  // if a valid URL, make it a link
  try {
    url = new URL(data);
    return "<a target='_blank' href='" + data + "'>Link</a>";
  } catch (_) {
    // if a MP location, split
    var location = "";
    var hierarchy = data.split('>');
    for (var i in hierarchy) {
      if (hierarchy[i] === " City of Rocks ") {
        return location;
      }
      if (i > 0) location += " > ";
      location += hierarchy[i];
    }
    return data;
  }
}

// associate a Leaflet marker with a data row/object
function addMarker(item) {
  // build the marker
  var title = formatData(item["Location"]);
  var popup = formatData(item["Location"]);
  var marker = L.marker([item["Area Latitude"], item["Area Longitude"]], {
    opacity: 1,
    title: title
  }).bindPopup(popup);
  // add it to the object
  item.marker = marker;
}
// add markers to the CSV objects
function addMarkers(data) {
  // For each row in data, create a marker and add it to the row/object
  for (var i in data) {
    var row = data[i];
    addMarker(row);
  }
}

// --------------------------------------------------
// all use of globals should be limited to below here
// --------------------------------------------------
function focus(row) {
  //mapview.flyTo(row.marker);
  row.marker.openPopup();
  frameview.goToRoute(row.URL);
  tableview.highlight(row.URL);
}
// refresh data in all views; to be called if change to data, filtering, or sorting
function refresh() {
  mapview.clear();
  mapview.addData(datamodel.filteredData);
  mapview.resetZoom();
  
  //frameview.clear();
  
  tableview.clear();
  tableview.addRows(datamodel.filteredData, focus, mapview.boundsPredicate.bind(mapview));
}
function sortby(field, asc=true) {
  datamodel.sortBy(field, asc);
  tableview.clear();
  tableview.addRows(datamodel.filteredData, focus, mapview.boundsPredicate.bind(mapview));
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
  sieve.set(e.target.parentElement.field, newsieve);
}
function updateStringSieve(e) {
  var newsieve = new StringSieve();
  newsieve.set(document.getElementById("inputStr").value.split(";"));
  sieve.set(e.target.parentElement.field, newsieve);
}
function closeFilterDialog() {
  var dialog = document.getElementById("filter-dialog");
  dialog.style.visibility = "hidden";
  dialog.style.display = "none";
  datamodel.filter(sieve.predicate.bind(sieve));
  refresh();
}

const fileSelector = document.getElementById('file-selector');
const delimText = document.getElementById('delim-text');
const goButton = document.getElementById('go-button');
goButton.addEventListener('click', (event) => {
    const fileList = fileSelector.files;
    readFile(fileList[0], delimText.value[0]);
  });
function readFile(fname, delim) {
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    importData(event.target.result, delim);
  });
  reader.readAsText(fname);
}

var mapview;
var frameview;
var tableview;
var sieve;
var datamodel;


function importData(csvString, delimiter=",") {
  // Use PapaParse to convert string to array of objects
  var result = Papa.parse(csvString, {delimiter: delimiter, header: true, dynamicTyping: false, skipEmptyLines: true});
  // associate markers with each data row/object
  addMarkers(result.data);

  // put it in a data model
  sieve = new FieldSieve();
  datamodel = new DataModel(result.data);
  datamodel.filter(sieve.predicate.bind(sieve));
  
  mapview = new MapView();
  mapview.addData(datamodel.filteredData);
  mapview.resetZoom();
  
  tableview = new TableView("data-table");
  tableview.addHeader(datamodel.keys);
  tableview.addRows(datamodel.filteredData, focus, mapview.boundsPredicate.bind(mapview));
  
  // set mapview move listener
  mapview.map.on('moveend', function(e) {
    tableview.clear();
    tableview.addRows(datamodel.filteredData, focus, mapview.boundsPredicate.bind(mapview));
    });
    
  frameview = new FrameView("preview-frame", connect=false);
}