// utils
const { reject } = require('./utils/response');
const { parseCookies } = require('./utils/cookies');
const { parseQueryString, getReferer } = require('./utils/urls');

// handlers
const { handleAuthorizationCodeRequest } = require('./handleAuthorizationCode');
const { handleCookies } = require('./handleRequestWithCookies');
const { handleNoAuth } = require('./handleNoAuth');

/**
 * Main function that runs on Viewer-Request CloudFront events.
 *
 * Attempts to validate incoming redirects from the Cognito authorization site, storing
 * successful login results in a cookie.
 *
 * If a cookie is already present, tries to authenticate the user using the cookie.
 *
 * If for any reason the request is found to have invalid auth data, a 401 response is returned.
 * If the request is found to have expired auth data or no auth data, the user is redirected to the login page with a 302 response.
 * If valid auth data is present, the original request is returned, signifying to CloudFront that it should continue the request.
 *
 * @param event - The event object from CloudFront
 * @returns An immediate HTTP response, or the original request if CloudFront should continue
 */
exports.handler = async (event) => {
  const { request } = event.Records[0].cf;
  const { headers } = request;

  // Handle the case where the current page is referred to by the Cognito login page
  // result, and the authorization code is in the referer url.
  const referer = getReferer(headers);
  if (referer) {
    return reject(`
      The referer ${referer} had an authorization code, but we do not
      want to validate that code here as the code can only be validated
      once, and we want to make sure original request to the referer url
      can successfully exchange the code.
    `);
  }

  // Parse the final destination the user wants to go to
  const origin = `https://${headers.host[0].value}`;
  const querystring = request.querystring ? `?${request.querystring}` : '';
  const finalDestinationUri = `${origin}${request.uri}${querystring}`;

  const cookies = parseCookies(headers);

  // Handle the case where the current page is a redirect from the
  // Cognito login page with a query param for the authorization code set
  const parsedQueryString = parseQueryString(request);
  if (parsedQueryString) {
    const { code, state } = parsedQueryString;
    return handleAuthorizationCodeRequest(code, state, cookies, origin);
  }

  // Handle the case where a cookie is set for the JWT
  if (cookies && cookies.transcend_internal_id_token) {
    return handleCookies(
      cookies.transcend_internal_id_token,
      origin,
      finalDestinationUri,
      request,
    );
  }

  // Handle the case where none of the above are true, meaning there is
  // no authorization info present. In this case, we redirect to the login page.
  return handleNoAuth(origin, finalDestinationUri);
};
