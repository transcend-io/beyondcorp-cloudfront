// utils
const { exchangeCodeForToken } = require('./utils/oauth');
const { reject, redirect } = require('./utils/response');
const { logger } = require('./utils/logger');

// external
const { decode } = require('urlsafe-base64');

/**
 * Parses state into it's stored values
 *
 * @param state - The base64 encode state being passes along with the login request
 * @returns The values encoded in the state
 */
function parseState(state) {
  const decoded = JSON.parse(
    Buffer.from(decode(state), 'base64').toString('utf8'),
  );

  if (!decoded || !decoded.nonce || !decoded.requestedUri) {
    throw Error(
      'Invalid state query parameter, did not contain expected values',
    );
  }

  return decoded;
}

/**
 * Throws an error if the nonce sent in the cookie does not match the nonce from the query string
 *
 * @param state - The base64 encoded state being passed along with the login request
 * @param cookies - The cookies set on the request
 * @throws an error on any validation mismatch
 */
function validateNoncesMatch(state, cookies) {
  const { nonce } = parseState(state);
  if (!nonce) {
    throw Error('Did not find nonce in query string state');
  }

  const { transcend_internal_nonce } = cookies;
  if (!transcend_internal_nonce) {
    throw Error('Did not find nonce in cookie');
  }

  if (nonce !== transcend_internal_nonce) {
    throw Error('nonces did not match');
  }
}

/**
 * Handles any requests that had an authorization code present.
 *
 * This will occur directly after logging in through the Cognito login page,
 * which redirects to the content url (the page the user actually wants to get to).
 *
 * This function will validate the nonces from the cookies/query params, and will exchange
 * the authorization code for tokens, but will _not_ validate those tokens. The tokens,
 * whether valid or invalid, are just stored into cookies that can be validated whenever
 * a protected url is gone to.
 *
 * @param code - The authorization code returned from the Cognito login
 * @param state - The base64 encoded state being passed along with the login request
 * @param cookies - The cookies set on the request
 * @param host - The url of the content page the user is eventually hoping to be redirected to
 * @returns An immediate HTTP response to the browser, never going to the origin server
 */
exports.handleAuthorizationCodeRequest = async (code, state, cookies, host) => {
  try {
    validateNoncesMatch(state, cookies);
  } catch (err) {
    logger.error(err);
    return reject(`Failed to validate nonce params`);
  }

  let tokens;
  try {
    const { transcend_internal_pkce } = cookies;
    tokens = await exchangeCodeForToken(code, host, transcend_internal_pkce);
  } catch (err) {
    logger.error(err);
    return reject(`Failed to fetch token. Error: ${err}`);
  }

  logger.info(`Returning code 302 with JWTs in cookies`);

  // TODO: Set the cookie on the top level domain
  const { requestedUri } = parseState(state);
  return redirect(requestedUri, {
    transcend_internal_id_token: tokens.id_token,
    transcend_internal_access_token: tokens.access_token,
    transcend_internal_refresh_token: tokens.refresh_token,
  });
};
