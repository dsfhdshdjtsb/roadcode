otmApiKey= "";
gmApiKey = ""


const userAction = async (link) => {
    const response = await fetch(link);
    return await response.json(); //extract JSON from the http response
    // do something with myJson
  }

const getAttractions = async(radius, lat, lon, kinds) => {
    let kindsstr = toString(kinds);
    const attractions = await userAction("https://api.opentripmap.com/0.1/en/places/radius?radius="
    + radius
    + "&lon=" + lon
    + "&lat=" + lat 
    + "&kinds=" + kindsstr
    + "&format=geojson&apikey=" + otmApiKey);
    return attractions
}

const getAddress = async(latlng) => {
  console.log("Attempting to get address of " + latlng)
  const address = await userAction("https://maps.googleapis.com/maps/api/geocode/json?" +
  "latlng=" + latlng.lat() + "," + latlng.lng() + "&key=" + gmApiKey);
  return address
}

function getWater(latitude, longitude) {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(latitude, longitude);
    
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results.length > 0) {
          const addressComponents = results[0].address_components;
          const isOnWater = addressComponents.some(component => component.types.includes("natural_feature") && component.long_name === "Water");
          resolve(isOnWater);
        } else {
          reject(new Error("No results found."));
        }
      } else {
        reject(new Error("Geocoder failed due to: " + status));
      }
    });
  });
}
async function genDestinationPoint(lat, lon, radius, kinds)
{
    console.log("Attempting to generate destination point")
    let point;
    var count = 0;
    let onWater;
    do{
        point = generateRandomPoint(lat,lon, radius)
        count += 1;
        onWater = await getWater(point.lat, point.lon);
        attractions = await getAttractions(radius, point.lat, point.lon, kinds)
        console.log("Current attempt number:" + count)
        console.log("Current water status:" + onWater)
        console.log("Current number of nearby attractions:" + attractions.features.length)
    }while( count < 15 && (onWater|| attractions.features.length < 5))
    if(count < 15)
    {
        console.log("Valid destination found at coordinates" + attractions.features[0].geometry.coordinates);
        return attractions.features[0]
    }
    $(".errortext").text("Could not find a good destination point, please try again");
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
        result = result + kinds[i] + "%2C"
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
  console.log("generating " + num + " waypoints of kind " + toString(kinds));
    let locationList = [];
    var clusters = 5 //number of clusters dont worry about da name lol
    for(let i = 0; i < clusters; i++)
    {
        let radius = 16093;
        let count = 0
        let tempClusters = clusters
        let thisi = i;
        let maxAttractionsNum = -1;
        let maxAttractions
        do{
          let index = Math.floor(Math.random() * (waypointList.length / tempClusters * (thisi+1) - waypointList.length / tempClusters * thisi) + waypointList.length / tempClusters * thisi)
          var thisPoint = waypointList[index];
          var attractions = await getAttractions(16093, thisPoint.lat(), thisPoint.lng(), kinds)
          console.log(attractions);
          console.log("found " + attractions.features.length + " attractions about lat: " + thisPoint.lat() + " and lon: " + thisPoint.lng());
          console.log("current radius: " + radius + " meters" );
          radius *= 1.8
          console.log("Current attempt: " + count++);

          if(attractions.features.length > maxAttractionsNum)
          {
            maxAttractionsNum = attractions.features.length
            maxAttractions = attractions
          }
          let random = Math.random()
          if((i < 4 && i > 0 && random >= 0.5) || i == 0)
          {
            console.log("current thisi value: " + thisi)
            thisi += count;
            console.log("current tempClusters value: " + tempClusters);
            tempClusters += count;
          }
          else
          {
            console.log("current thisi value: " + thisi)
            console.log("current tempClusters value: " + tempClusters);
            tempClusters++
          }
        }while(attractions.features.length < num/5 && count < 3)
        if(attractions.features.length < num/5 )
        {
          attractions = maxAttractions
        }
        // const shuffled = shuffle(attractions.features);
        attractions.features.sort((a,b) => {
          return b.properties.rate - a.properties.rate
        })
        shuffled = attractions.features
        console.log("attractions sorted by popularity rate: ")
        console.log(shuffled)
        for(let j = 0; j < num/5; j++)
        {
          if(shuffled[j] != undefined)
          {
            let latlngobj = new google.maps.LatLng(shuffled[j].geometry.coordinates[1],shuffled[j].geometry.coordinates[0] )
            let address = await getAddress(latlngobj)
            if(address.plus_code.compound_code != undefined)
            {
              console.log("Pushing following address to list" + address.plus_code.compound_code)
              locationList.push({location: address.plus_code.compound_code, id: shuffled[j].id, latlng: latlngobj});
            }
          }
        }
    }
    console.log("finsihed generating waypoints! ")
    return locationList;
   
}

function genReturnWaypoint(lat_1, lon_1, lat_2, lon_2)
{
    if(!getWater(lat_1, lon_2))
    {
        return {"lat": lat_1, "lon": lon_2}
    }
    else if (!getWater(lat_2, lon_1))
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
    new PathHandler(map, autocomplete);
};

class PathHandler{
  directionsRenderer;
  directionsService;
  originPlace; //output of autocomplete
  start;
  kinds;
  map;
  markers;
  infowindows;
  destination;
  destinationCords;
  waypoints;
  createPathBtn;
  
  constructor(map){
    this.directionsRenderer = new google.maps.DirectionsRenderer({draggable: true, suppressMarkers:true});
    this.directionsService = new google.maps.DirectionsService();
    const autocomplete = new google.maps.places.Autocomplete($("#autocomplete")[0] ,{
      componentRestrictions: {'country' : ['US']},
      fields: ['address_components', 'geometry']
    })
    this.directionsRenderer.setMap(map);
    this.map = map;
    this.markers=[];
    this.infowindows=[];
    this.waypoints = [];
    this.originPlace = "";
    this.setupClickListener();
    this.setupPlaceChangedListener(autocomplete);
  }

  setupPlaceChangedListener(autocomplete) {
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      //verifies if place is a real place
      if (!place.geometry) {
        $(".errortext").text("Please select an option from the dropdown list");
      }else{
        console.log(place)
        this.originPlace=place;
      }
    });
  }

  setupClickListener() {
    this.createPathBtn = $(".createBtn")[0];
    const distanceTxt = $("#distanceTxt")[0];
    this.createPathBtn.addEventListener("click", () => {
      $(".errortext").text("")
      if (this.originPlace == "" || distanceTxt.value == "" || this.originPlace.address_components.length == undefined){
        $(".errortext").text("Please fill out all fields")
        return;
      }
      let distance = distanceTxt.value * 1600;
      if(distance > 2500 * 1600)
      {
        $(".errortext").text("Please enter a distance less than 2500 miles")
        return;
      }

      $(".loader").fadeIn();
      $(".createBtn").prop("disabled", true);
      this.start = ""
      for(let i = 0; i<this.markers.length; i++)
      {
        this.markers[i].setMap(null);
      }
      this.markers = [];
      for (let i=0; i<this.originPlace.address_components.length; i++){
        this.start += " " + this.originPlace.address_components[i].short_name;
      }
      let startCords = [this.originPlace.geometry.location.lat(), this.originPlace.geometry.location.lng()]

      this.kinds = this.handleCheckboxes();
      if (this.kinds == 1){
        return;
      }
      var self = this
      let counter = 0
      while(counter < 5){
        try{
          genDestinationPoint(startCords[0], startCords[1], distance, this.kinds).then(function(point){
            console.log("point")
            console.log(point)
            self.destinationCords = {location: "", id: point.id, latlng: new google.maps.LatLng(point.geometry.coordinates[1],point.geometry.coordinates[0] )}
            console.log("destinationCords")
            console.log(self.destinationCords);
            getAddress(new google.maps.LatLng(point.geometry.coordinates[1], point.geometry.coordinates[0])).then(function(output)
            {
              if(output == undefined || output.plus_code == undefined || output.plus_code.compound_code == undefined)
              {
                self.createPathBtn.dispatchEvent(new Event("click"));
                return;
              }
              console.log(output)
              self.destination = output.plus_code.compound_code
              console.log("Valid destination found at address " + self.destination);
              let end = "" + point[1] + ", " + point[0];
              return self.generateShortPath(self.start, self.destination)
            })
          }).then(function(){
            console.log(self.waypoints);
          })
          counter = 10

        }
        catch{
          counter++
        }
    }
  });

    // autocomplete.addEventListener('place_changed', function(){
    //   let place = autocomplete.getPlace();
    //   console.log(place)

    //   if (!place.geometry){
    //     $("#autocomplete").attr('placeholder', "Enter a place");
    //   }else{
    //     console.log(place.name)
    //   }
    // });
}

  handleCheckboxes(){
    let allChecked = $(".checkOption:checked");
    let output = []
    if (allChecked.length > 0){
      for (let i = 0; i < allChecked.length; i++){
          output.push(allChecked[i].value)
      }
      return output
    }else{
      $(".errortext").text("Please select some filters")
      return 1;
    }
  }

  generateShortPath(start, end){
    console.log("Attempting to generate short path from" + start + " to " + end);
    this.directionsService
    .route({
      origin: start, //can also take placeId and long/lat
      destination: end,
      travelMode: "DRIVING",
    })
    .then((response) => { 
      let originalPath = response.routes[0].overview_path; //array of coords on the shortest path
      console.log(originalPath);
      console.log("Generated array of " + originalPath.length + " points from shortpath");

      var self = this
      console.log("Attempting to generate POI");
      genWaypoints(originalPath, 25, this.kinds).then(function(waypoints){
        self.waypoints = waypoints
        self.createFinalPath();
      })
      console.log("waypoints:" + this.waypoints)
    })
    .catch((e) => {
      console.log("short path not found")
      this.createPathBtn.dispatchEvent(new Event("click"));
    });
  }

  createMarkers(){
    var self = this;
    var i = 0;        
    this.waypoints.push(this.destinationCords);
    console.log(this.waypoints);
    console.log(self.waypoints.length)          
    function myLoop() {         
      setTimeout(function() {   
        let marker = new google.maps.Marker({
          position: self.waypoints[i].latlng,
          title: "Waypoint"
        })
        marker.setMap(self.map);
        userAction("https://api.opentripmap.com/0.1/en/places/xid/" + self.waypoints[i].id + "?apikey=" +otmApiKey).then(function(locationData){
          self.markers.push(marker);
          self.createInfoWindow(marker, locationData);
        })
        i++;                    
        if (i < self.waypoints.length) {           
          myLoop();            
        }                      
      }, 350)
    }

      myLoop();    
  }

  createInfoWindow(marker, locData){
    var self = this;
    console.log(locData)
    let descrip = "No description";
    let wikiLink = "";
    let infoContent = "";
    if (locData.wikipedia_extracts != undefined){
      if (locData.wikipedia.substring(0,10) == "https://en"){
        descrip = locData.wikipedia_extracts.html;
        wikiLink = locData.wikipedia;
      }
    }

    if (locData.image != undefined){
      infoContent = "<div style='font-family: sans-serif;'><p style='text-align: center;'><span style='text-decoration: underline;'><strong>"+ locData.name +
      "</strong></span></p><p>tags: "+locData.kinds+"</p>" + descrip +"<br/><a href='"+wikiLink+"'>"+wikiLink+"</a><p>&nbsp;</p><img style='display: block; margin-left: auto; margin-right: auto;' src='"+ locData.preview.source +"' alt='' width='"+locData.preview.width+"' height='"+locData.preview.height+"'/></div>"
    }else{
      infoContent = "<div style='font-family: sans-serif;'><p style='text-align: center;'><span style='text-decoration: underline;'><strong>"+ locData.name +
      "</strong></span></p><p>tags: "+locData.kinds+"</p>" + descrip +"<br/><a href='"+wikiLink+"'>"+wikiLink+"</a><p>&nbsp;</p></div>"
    }

    let infoWindow = new google.maps.InfoWindow({
      content: infoContent
    })
    this.infowindows.push(infoWindow);
    marker.addListener("click", () =>{
      infoWindow.open({
        anchor: marker,
        shouldFocus: false,
      })
      infoWindow.setMap(self.map)
    })


    this.map.addListener("click", ()=>{
      this.closeInfoWindows();
    })
    $(".loader").fadeOut();
    $(".createBtn").prop("disabled", false);
  }

  closeInfoWindows(){
    for (let i=0; i < this.infowindows.length; i++){
      if (this.infowindows[i]){
        this.infowindows[i].close();
      }
    }
  }

  createFinalPath(){
    console.log("creating final path from " + this.start + " to " + this.destination);
    let waypointNoID = JSON.parse(JSON.stringify(this.waypoints));
    console.log(waypointNoID);
    // for (let i = 0; i < 5; i++){
    //   userAction("https://api.opentripmap.com/0.1/en/places/xid/" + this.waypoints[i].id + "?apikey=" +otmApiKey).then(function(location){
    //     console.log(location)
    //     console.log(location.wikipedia)
    //   })
    // }
    for (let i = 0; i < waypointNoID.length; i++){
      delete waypointNoID[i].id
      delete waypointNoID[i].latlng;
    }
    console.log("waypoint no id");
    console.log(this.waypoints);
    this.directionsService
    .route({
      origin: this.start, //can also take placeId and long/lat
      destination: this.destination,
      waypoints: waypointNoID,
      travelMode: "DRIVING",
      optimizeWaypoints: true,
      provideRouteAlternatives: false,
    })
    .then((response) => {
      this.directionsRenderer.setDirections(response); //if direction service receives a response, then render the directions given
      this.createMarkers();
    })
    .catch((e) => {

      console.log("directions failed")    
      this.createPathBtn.dispatchEvent(new Event("click"));
    }
    ); //else no response, leave error message
    
  }

}

// function calculateAndDisplayRoute(directionsService, directionsRenderer) {
//   const waypoints = [{location: "bakersfield, ca"}, {location:"tampa, fl"}]; //order doesn't matter as long as optimizeWaypoints is set to true 


// }
