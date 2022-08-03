// utils
const { CLIENT_ID, SCOPES, AUTH_DOMAIN } = require('./utils/config');
const { redirect } = require('./utils/response');
const { generatePkceVerifier, generateNonce } = require('./utils/crypto');
const { logger } = require('./utils/logger');

// external
const { encode } = require('urlsafe-base64');
const { stringify } = require('querystring');

/**
 * Handles the case where no auth info is present, but the client requested
 * a protected page.
 *
 * In this case, the only outcome is a redirect to the login page.
 *
 * @param redirectUri - The registered callback url after logging in through Cognito
 * @param requestedUri - The final page the user wants to go to upon success
 * @returns a 302 HTTP response redirecting to the login page
 */
exports.handleNoAuth = async (redirectUri, requestedUri) => {
  logger.info(`Returning code 302 to login page for redirectUri:${redirectUri} and requestedUri:${requestedUri}`);

  // Protects against XSS, CSRF attacks, and Authorization Code theft
  const nonce = generateNonce();
  const { pkce, pkceHash } = generatePkceVerifier();

  const queryParams = stringify({
    client_id: CLIENT_ID,
    scopes: SCOPES,
    redirect_uri: redirectUri + '/handleCode.html',
    response_type: 'code',
    state: encode(
      Buffer.from(JSON.stringify({ nonce, requestedUri })).toString('base64'),
    ),
    code_challenge_method: 'S256',
    code_challenge: pkceHash,
  });

  return redirect(`${AUTH_DOMAIN}/login?${queryParams}`, {
    transcend_internal_nonce: encodeURIComponent(nonce),
    transcend_internal_pkce: encodeURIComponent(pkce),
  });
};
