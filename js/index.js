otmApiKey= "5ae2e3f221c38a28845f05b63f732523be8926b6484b88151a8dd476";
gmApiKey = "AIzaSyCTlMIrLbEtYu8K7Kheto9hxaIqWjzOQ8E"

const fetchJson = async (link) => {
    const response = await fetch(link);
    const myJson = await response.json(); //extract JSON from the http response
}

function initMap() {
    const directionsRenderer = new google.maps.DirectionsRenderer({draggable: true});
    const directionsService = new google.maps.DirectionsService();
    map = new google.maps.Map($("#map")[0], {
        center: { lat: 36.967243, lng: -99.771556}, //center of US
        zoom: 5,
    });
    directionsRenderer.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsRenderer);
};

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  const waypoints = [{location: "bakersfield, ca"}, {location:"tampa, fl"}]; //order doesn't matter as long as optimizeWaypoints is set to true

  directionsService
    .route({
      origin: "Irvine, CA", //can also take placeId and long/lat
      destination: "New York City, New York",
      waypoints: waypoints,
      travelMode: "DRIVING",
      optimizeWaypoints: true,
    })
    .then((response) => {
      directionsRenderer.setDirections(response); //if direction service receives a response, then render the directions given
    })
    .catch((e) => window.alert("Directions request failed")); //else no response, leave error message
}



  


  userAction('http://api.opentripmap.com/0.1/en/places/bbox?lon_min=38.364285&lat_min=59.855685&lon_max=38.372809&lat_max=59.859052&kinds=churches&format=geojson&apikey=' + otmApiKey);
  userAction('http://api.opentripmap.com/0.1/en/places/xid/W37900074?apikey=' + otmApiKey);