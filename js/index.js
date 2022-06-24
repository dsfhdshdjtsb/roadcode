api_key = "5ae2e3f221c38a28845f05b63f732523be8926b6484b88151a8dd476";



const userAction = async (link) => {
    const response = await fetch(link);
    return await response.json(); //extract JSON from the http response
    // do something with myJson
  }

const getAttractions = async(radius, lat, lon, kinds,) => {
    let kindsstr = toString(kinds);
    const attractions = await userAction("http://api.opentripmap.com/0.1/en/places/radius?radius="
    + radius
    + "&lon=" + lon
    + "&lat=" + lat 
    + "&kinds=" + kindsstr
    + "&format=geojson&apikey=" + api_key);
    return attractions
}

function genDestination(lat, lon, radius)
{
    let point = {'lat': lat, 'lon': lon };
    while(point < radius * .90)
    {
        point = generateRandomPoint(lat, lon, radius)
    }
    return point
}

function generateRandomPoint(lat, lon, radius) {
    var x0 = lon;
    var y0 = lat;
    // Convert Radius from meters to degrees.
    var rd = radius/111300;
  
    var u = Math.random();
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
async function logPromiseResult() {
    console.log(await getAttractions(1000000, -117.798633, 33.656956, ["historic"]));
  }
logPromiseResult();

userAction('http://api.opentripmap.com/0.1/en/places/bbox?lon_min=38.364285&lat_min=59.855685&lon_max=38.372809&lat_max=59.859052&kinds=churches&format=geojson&apikey=' + api_key);
userAction('http://api.opentripmap.com/0.1/en/places/xid/W37900074?apikey=' + api_key);