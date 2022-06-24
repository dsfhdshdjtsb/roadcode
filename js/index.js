api_key = "5ae2e3f221c38a28845f05b63f732523be8926b6484b88151a8dd476";



const userAction = async () => {
    const response = await fetch('http://api.opentripmap.com/0.1/en/places/xid/Q372040?apikey=5ae2e3f221c38a28845f05b63f732523be8926b6484b88151a8dd476');
    const myJson = await response.json(); //extract JSON from the http response
    console.log(myJson);
    // do something with myJson
  }


  userAction();