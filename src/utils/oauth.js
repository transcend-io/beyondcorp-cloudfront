const axios = require("axios").default;
const { stringify } = require("querystring");

const {
  AUTH_DOMAIN,
  CLIENT_ID,
  // CLIENT_SECRET,
  // CLIENT_SECRET_PARAM_NAME,
  // fetchSsmParam,
} = require("./config");

/**
 * Exchanges an authorization code for a JWT using the oauth server.
 *
 * @param code - the authorization code returned from Cognito
 * @param redirectUri - The URI the user is attempting to reach
 * @param pkce - The pkce token to verify the authorization code with
 */
async function exchangeCodeForToken(code, redirectUri, pkce) {
  const authDomain = AUTH_DOMAIN;
  const tokenExchangeUrl = `${authDomain}/oauth2/token`;

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const params = stringify({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    redirect_uri: redirectUri + '/handleCode.html',
    code,
    code_verifier: pkce,
  });

  const { data } = await axios.post(tokenExchangeUrl, params, {
    headers,
    // auth: {
    //   username: CLIENT_ID,
    //   password: CLIENT_SECRET,
    //   // password: await fetchSsmParam(CLIENT_SECRET_PARAM_NAME)
    // },
  });

  if (!data) {
    throw Error("Could not parse data from token exchange url");
  }

  const { id_token, access_token, refresh_token } = data;
  if (!id_token || !access_token || !refresh_token) {
    throw Error("Did not receive all expected tokens from token exchange url");
  }

  return { id_token, access_token, refresh_token };
}

exports.exchangeCodeForToken = exchangeCodeForToken;
