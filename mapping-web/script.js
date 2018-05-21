// access token
key = 'pk.eyJ1IjoiaGFnaW44MSIsImEiOiJjamhkYnI3OXMwOXhvM2NtbGRreWdpYnNlIn0.xa19EIY7LAkFsF8cmWm3lA';

var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json( earthquakeURL, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
          "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
      },

      pointToLayer: function (feature, latlng) {
        return new L.circle(latlng,
          {radius: 25000 *  feature.properties.mag,
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .6,
          color: "#000",
          stroke: true,
          weight: .8
      })
    }
    });



  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define layers
  var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=" + key );
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=" + key );
  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=" + key );

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Grayscale": grayscale,
    "Outdoors": outdoors,
    "Satellite": satellite

};

// layer for tectonic plates
var plates = new L.LayerGroup();

  // Add tectonic plates data
  d3.json( platesURL, function(tectonicData) {
    L.geoJson(tectonicData, {
        color: "#E39403",
        weight: 2
    })
    .addTo( plates );
});

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": plates
    
};

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      36.77, -109.41
    ],
    zoom: 5,
    layers: [ grayscale, earthquakes, plates ]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // legend
 var legend = L.control({position: 'bottomright'});

 legend.onAdd = function (map) {
 
   var div = L.DomUtil.create('div', 'info legend'),
     grades = [ 0, 1 , 2, 3 , 4, 5 ],
     labels = [],
     from, to;
 
   for (var i = 0; i < grades.length; i++) {
     from = grades[i];
     to = grades[i + 1];
 
     labels.push(
       '<i style="background:' + getColor(from + 1) + '"></i> ' +
       from + (to ? '&ndash;' + to : '+'));
   }
 
   div.innerHTML = labels.join('<br>');
   return div;
 };
 
 legend.addTo(myMap); 
}

	// get color depending on magnitude of earthquake
	function getColor(d) {
		return d > 5 ? '#800026' :
				d > 4  ? '#BD0026' :
				d > 3  ? '#E31A1C' :
				d > 2  ? '#FC4E2A' :
				d > 1  ? '#FD8D3C' :
				d > 0  ? '#FEB24C' :
							'#FFEDA0';
  }

 