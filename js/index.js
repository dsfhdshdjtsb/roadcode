otmApiKey= "5ae2e3f221c38a28845f05b63f732523be8926b6484b88151a8dd476";
gmApiKey = "AIzaSyCTlMIrLbEtYu8K7Kheto9hxaIqWjzOQ8E"
wApiKey = "jA5nqVNx_QBSh4TNxLr-"


const userAction = async (link) => {
    const response = await fetch(link);
    return await response.json(); //extract JSON from the http response
    // do something with myJson
  }

const getAttractions = async(radius, lat, lon, kinds) => {
    let kindsstr = toString(kinds);
    const attractions = await userAction("http://api.opentripmap.com/0.1/en/places/radius?radius="
    + radius
    + "&lon=" + lon
    + "&lat=" + lat 
    + "&kinds=" + kindsstr
    + "&format=geojson&apikey=" + otmApiKey);
    return attractions
}

const getAddress = async(latlng) => {
  const address = await userAction("https://maps.googleapis.com/maps/api/geocode/json?" +
  "latlng=" + latlng.lat() + "," + latlng.lng() + "&key=" + gmApiKey);

  return address
}

const getWater = async(lat, lon) => {
    const water = await userAction("https://api.onwater.io/api/v1/results/" + lat +","+ lon + "?access_token=" + wApiKey)
    return water;
}

async function genDestinationPoint(lat, lon, radius, kinds)
{
    let point;
    var count = 0;
    let onWater;
    do{
        point = generateRandomPoint(lat,lon, radius)
        count += 1;
        onWater = await getWater(point.lat, point.lon);
        attractions = await getAttractions(radius, point.lat, point.lon, kinds)
        console.log(count < 10)
        console.log(onWater.water)
        console.log(attractions.features.length)
    }while( count < 10 && (onWater.water || attractions.features.length < 5))
    if(count < 10)
    {
        return attractions.features[0].geometry.coordinates
    }
    console.log("could not find a good destination point")
    return false;
    
}

function generateRandomPoint(lat, lon, radius) {
    var x0 = lon;
    var y0 = lat;
    // Convert Radius from meters to degrees.
    var rd = radius/111300;
  
    var u = 1 - Math.random() * 0.1;
    var v = Math.random();
  
    var w = rd * Math.sqrt(u);
    var t = 2 * Math.PI * v;
    var x = w * Math.cos(t);
    var y = w * Math.sin(t);
  
    var xp = x/Math.cos(y0);
  
    // Resulting point.
    return {'lat': y+y0, 'lon': xp+x0};
  }

function toString(kinds){
    let result = "";
    for(let i = 0; i < kinds.length; i++)
    {
        result += kinds[i]
    }
    return result
}
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

async function genWaypoints(waypointList, num, kinds){
    let locationList = [];
    var clusters = 5 //number of clusters dont worry about da name lol
    for(let i = 0; i < clusters; i++)
    {
        console.log(clusters)
        let radius = 16093;
        let count = 0
        let tempClusters = clusters
        let thisi = i;
        let maxAttractionsNum = -1;
        let maxAttractions
        do{
          let index = Math.floor(Math.random() * (waypointList.length / tempClusters * (thisi+1) - waypointList.length / tempClusters * thisi) + waypointList.length / tempClusters * thisi)
          var thisPoint = waypointList[index];
          var attractions = await getAttractions(16093, thisPoint.lat(), thisPoint.lng(), toString(kinds))
          
          console.log(attractions);
          console.log(radius *= 1.8);
          console.log(count ++);

          if(attractions.features.length > maxAttractionsNum)
          {
            maxAttractionsNum = attractions.features.length
            maxAttractions = attractions
          }
          let random = Math.random()
          if((i < 4 && i > 0 && random >= 0.5) || i == 0)
          {
            console.log(thisi += count)
            console.log(tempClusters += count)
          }
          else
          {
            console.log("test1")
            tempClusters++
            console.log(thisi)
            console.log(tempClusters)
          }
        }while(attractions.features.length < num/5 && count < 3)
        if(attractions.features.length < num/5 )
        {
          attractions = maxAttractions
        }
        const shuffled = shuffle(attractions.features);
        for(let j = 0; j < num/5; j++)
        {
          if(shuffled[j] != undefined)
          {
            
            let address = await getAddress(new google.maps.LatLng(shuffled[j].geometry.coordinates[1],shuffled[j].geometry.coordinates[0] ))
            locationList.push({location: address.plus_code.compound_code})
          }
        }
        console.log(locationList)
    }
    return locationList;
   
}

function genReturnWaypoint(lat_1, lon_1, lat_2, lon_2)
{
    if(!getWater(lat_1, lon_2).water)
    {
        return {"lat": lat_1, "lon": lon_2}
    }
    else if (!getWater(lat_2, lon_1).water)
    {
        return {"lat": lat_2, "lon": lon_1}
    }
    else
    {
        return false
    }
}

function initMap() {
    map = new google.maps.Map($("#map")[0], {
        center: { lat: 36.967243, lng: -99.771556 }, //center of US
        zoom: 5,
    });
    var test = new PathHandler(map);
};

class PathHandler{
  directionsRenderer;
  directionsService;
  destination
  waypoints;
  
  constructor(map){
    this.directionsRenderer = new google.maps.DirectionsRenderer({draggable: true});
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer.setMap(map);
    this.waypoints;
    this.setupClickListener();
  }

  setupClickListener() {
    const btn1 = $("#coolBtn")[0];

    btn1.addEventListener("click", () => {
      let start = "33.6846, -117.8265"
      var self = this
      genDestinationPoint(33.6846, -117.8265, 2000000, ["historic"]).then(function(point){
        getAddress(new google.maps.LatLng(point[1], point[0])).then(function(output)
        {
          console.log(output)
          self.destination = output.plus_code.compound_code
        })
        console.log(self.destination)
        let end = "" + point[1] + ", " + point[0];
        console.log(end);
        return self.generateShortPath(start,end)
      }).then(function(){
        console.log(self.waypoints);
      })
    });
  }

  generateShortPath(start, end){
    this.directionsService
    .route({
      origin: start, //can also take placeId and long/lat
      destination: end,
      travelMode: "DRIVING",
    })
    .then((response) => { 
      let originalPath = response.routes[0].overview_path; //array of coords on the shortest path
      console.log(originalPath[1].lat() + ", " + (originalPath[1].lng())); 
      console.log(originalPath.length) //amount of coords in the path
      console.log(originalPath);
      var self = this
      genWaypoints(originalPath, 25, ["historic"]).then(function(waypoints){
        console.log(waypoints)
        self.waypoints = waypoints
        self.createFinalPath();
      })
      console.log(this.waypoints)
    })
  }

  createFinalPath(){
    this.directionsService
    .route({
      origin: "Irvine, CA", //can also take placeId and long/lat
      destination: this.destination,
      waypoints: this.waypoints,
      travelMode: "DRIVING",
      optimizeWaypoints: true,
      provideRouteAlternatives: true,
    })
    .then((response) => {
      this.directionsRenderer.setDirections(response); //if direction service receives a response, then render the directions given
    })
    .catch((e) => window.alert("Directions request failed")); //else no response, leave error message
  }

}

// function calculateAndDisplayRoute(directionsService, directionsRenderer) {
//   const waypoints = [{location: "bakersfield, ca"}, {location:"tampa, fl"}]; //order doesn't matter as long as optimizeWaypoints is set to true 


// }
