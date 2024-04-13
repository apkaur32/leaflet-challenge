// Store our API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"; 

// Perform a GET request to the query URL and console log it
d3.json(queryUrl).then(function(data) {
  console.log(data);
    // Once we get a response, send the "data.features" object to the (1) createFeatures function.
  createFeatures(data.features);
});

// (0)
function getColor(depth) {
    return depth <= 10 ? '#66ff00' : // Bright green
           depth <= 30 ? '#ccff00' : // Flourescent yellow
           depth <= 50 ? '#ffcc33' : // Sunglow (mustard-yellow)
           depth <= 70 ? '#ff9933' : // Deep saffron
           depth <= 90 ? '#ff8243' : // Mango Tango (reddish-orange)
                        '#ff0000';   // else Red = for 90+ 
}
// source: https://leafletjs.com/examples/choropleth/
// source: https://www.colorhexa.com/color-names


// (1)
function createFeatures(earthquakeData) {

    // Define a function to run once for each feature in the data.features array 
    // Give each feature a popup that describes the place, time, magnitude, and depth of earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr>
      <p>Time: ${new Date(feature.properties.time)}</p>
      <p>Magnitude: ${feature.properties.mag}</p>
      <p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    } 
    // pointToLayer function is passed a LatLng parameter already with latitude and longitude of feature;
    // and returns an instance of CircleMarker. 
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 5, // adjust size based on magnitude
                fillColor: getColor(feature.geometry.coordinates[2]), // fill color by depth (third coordinate) 
                color: "#000",  // black outline of circle
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: onEachFeature
    });
    // Send our earthquakes layer to the (2) createMap function.
    createMap(earthquakes);
}
// source: https://leafletjs.com/examples/geojson/
// source: https://leafletjs.com/examples/choropleth/ 


// (2)
function createMap(earthquakes) {

    // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control. 
  // Pass it our baseMaps and overlayMaps, 
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Set up the legend
  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ['#66ff00', '#ccff00', '#ffcc33', '#ff9933', '#ff8243', '#ff0000'];
    
    // Loop through our depth intervals and generate a label with a colored square for each interval
    // nbsp(non-breaking space) prevents separate line breaks; inline-block removes vertical spacing in boxes
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '; display: inline-block; ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] : '+') + '<br>';
    }

    return div;
  };

// Adding the legend to myMap
legend.addTo(myMap);

}
// source: https://leafletjs.com/examples/choropleth/
// source: https://stackoverflow.com/questions/35778338/custom-legend-with-r-leaflet 
// main source: Class Exercises Module #15.1.10, #15.2.4
