// MapView object for managing the map view
function MapView() {
  // set up display properties
  this.sizefield = null;
  this.shapefield = null;
  this.huefield = null;
  this.saturfield = null;
  this.lightfield = null;
  this.alphafield = null;
  // create layers and map
  var otmLayer = L.tileLayer('https://a.tile.opentopomap.org/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery &copy; <a href="https://www.opentopomap.org/">opentopomap.org</a>',
		id: 'mapbox/outdoors-v11',
		tileSize: 512,
		zoomOffset: -1
	});
  var outdoorLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGphc3oiLCJhIjoiY2wxcDQ4eG1pMHZxNDNjcGM3djJ4eGphMCJ9.aH-D5oeZHZVzcWQZeeRviQ', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/outdoors-v11',
		tileSize: 512,
		zoomOffset: -1
	});
  var satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGphc3oiLCJhIjoiY2wxcDQ4eG1pMHZxNDNjcGM3djJ4eGphMCJ9.aH-D5oeZHZVzcWQZeeRviQ', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/satellite-v9',
		tileSize: 512,
		zoomOffset: -1
	});
  var baseMaps = {
    "OpenTopoMap": otmLayer,
    "Mapbox OTM": outdoorLayer,
    "Satellite": satelliteLayer
  };
	this.map = L.map('map').setView([0,0], 1);
  this.markers = L.featureGroup().addTo(this.map);
  L.control.layers(baseMaps).addTo(this.map);
  outdoorLayer.addTo(this.map);
}
MapView.prototype.flyTo = function(marker) {
  this.map.flyTo(marker.getLatLng(), 18);
  marker.openPopup();
};
MapView.prototype.resetZoom = function() {
  if (this.markers.getLayers().length > 0) {
    this.map.fitBounds(this.markers.getBounds());
  }
};
MapView.prototype.clear = function() {
  this.markers.clearLayers();
};
MapView.prototype.addData = function(data, predicate = function(item) { return true; }) {
  if (null === data) return;
  for (let row of filter(data, predicate)) {
    if (row.marker) {
      this.markers.addLayer(row.marker);
      
      // set display of marker
      // calculate display values
      if (this.sizefield) {
        var r = interpolate(row[this.sizefield], datamodel.ranges[this.sizefield].min, datamodel.ranges[this.sizefield].max, 20, 100);
      } else {
        r = 50;
      }
      if (this.shapefield) {
        var n = interpolate(row[this.shapefield], datamodel.ranges[this.shapefield].min, datamodel.ranges[this.shapefield].max, 3, 8);
      } else {
        n = 3;
      }
      if (this.huefield) {
        var h = interpolate(row[this.huefield], datamodel.ranges[this.huefield].min, datamodel.ranges[this.huefield].max, 60, 300);
      } else {
        h = 240;
      }
      if (this.saturfield) {
        var s = interpolate(row[this.saturfield], datamodel.ranges[this.saturfield].min, datamodel.ranges[this.saturfield].max, 10, 100);
      } else {
        s = 100;
      }
      if (this.lightfield) {
        var l = interpolate(row[this.lightfield], datamodel.ranges[this.lightfield].min, datamodel.ranges[this.lightfield].max, 20, 80);
      }
      else {
        l = 80;
      }
      if (this.alphafield) {
        var a = interpolate(row[this.alphafield], datamodel.ranges[this.alphafield].min, datamodel.ranges[this.alphafield].max, .10, 1);
      } else {
        a = 1;
      }
      // apply
      var pathElem = row.marker._icon.getElementsByTagName("path")[0];
      pathElem.setAttribute("d", polygon(Math.round(n), r));
      pathElem.style.fill = "hsla(" + h + ", " + s + "%, " + l + "%, " + a + ")";
    }
  }
};
MapView.prototype.boundsPredicate = function(latfield, lonfield, item) {
  var bounds = this.map.getBounds();
  var itemlat = toDegrees(item[latfield]);
  var itemlon = toDegrees(item[lonfield]);
  if (!itemlat || !itemlon) return true; // always display rows with no geodata
  return itemlat <= bounds.getNorth() &&
         itemlat >= bounds.getSouth() &&
         itemlon >= bounds.getWest() &&
         itemlon <= bounds.getEast();
};