// MapView object for managing the map view
function MapView() {
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
      var pathElem = row.marker._icon.getElementsByTagName("path")[0];
      var sizeField = datamodel.titlefield;
      var r = (row[sizeField] - datamodel.ranges[sizeField].min) / (datamodel.ranges[sizeField].max - datamodel.ranges[sizeField].min) * 80 + 20;
      var shapeField = datamodel.titlefield;
      var n = (row[shapeField] - datamodel.ranges[shapeField].min) / (datamodel.ranges[shapeField].max - datamodel.ranges[shapeField].min) * 5 + 3;
      pathElem.setAttribute("d", polygon(Math.round(n), r));
      // TODO hsla() for fill
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