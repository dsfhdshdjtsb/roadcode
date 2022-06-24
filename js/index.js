api_key = "5ae2e3f221c38a28845f05b63f732523be8926b6484b88151a8dd476";



const userAction = async (link) => {
    const response = await fetch(link);
    const myJson = await response.json(); //extract JSON from the http response
    console.log(myJson);
    // do something with myJson
  }


  userAction('http://api.opentripmap.com/0.1/en/places/bbox?lon_min=38.364285&lat_min=59.855685&lon_max=38.372809&lat_max=59.859052&kinds=churches&format=geojson&apikey=' + api_key);
  userAction('http://api.opentripmap.com/0.1/en/places/xid/W37900074?apikey=' + api_key);