const axios = require('axios');
const qs = require('qs');

let productIds = [
  "6d62d909-f957-430e-8689-b5129c0bb75e",
  "a0a4f044-b040-410d-8ead-4de0446aec7e",
  "808a2de1-1aaa-4c25-a9b9-6612e8f29a38",
  "510a0d7e-8e83-4193-b483-e27e09ddc34d",
  "ee3715be-b4ba-11ea-b3de-0242ac130004",
  "f4ebd070-b4ba-11ea-b3de-0242ac130004",
];

function getAllProducts(context, ee, next) {
  context.vars.allProducts = productIds;
  next();
}

function setRandomProductId(req, context, ee, next) {
  const index = Math.floor(Math.random() * productIds.length);

  req.form.productId = productIds[index];

  next();
}

function addRequestAuth(req, context, ee, next) {
  req.headers = {"Authorization": `Bearer ${context.vars.accessToken}`};
  next();
}

async function solveAccessToken(context, ee, next) {
  try {
    const tokenUrl = 'https://login.microsoftonline.com/cfdff24a-d784-41a7-951f-4180aa2c172b/oauth2/v2.0/token';
    const clientId = 'c41fa375-79a5-44c0-8414-f0b334020604';
    const scope = 'api://9bd41716-1271-4a0d-b4c7-a486674993ed/.default';
    const response = await axios.post(tokenUrl, qs.stringify({
         grant_type: 'client_credentials',
         client_id: clientId,
         client_secret: context.vars.clientSecret,
         scope: scope
       }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }});
    context.vars.accessToken =  response.data.access_token;
    next();
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return next(error);
  }
}

module.exports = {
  solveAccessToken,
  addRequestAuth,
  setRandomProductId,
  getAllProducts,
};
