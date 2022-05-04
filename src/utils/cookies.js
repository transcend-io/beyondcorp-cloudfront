const { parse } = require('cookie');

/**
 * Map of cookie names to what cookie params they should use
 *
 * Set `Path=/` so that the cookies are accessible across the whole site
 * Set `Max-Age=3600` to limit the authentication time to 1 hour
 * Set `Secure` to require HTTPS to be used
 * Set `HttpOnly` on the nonce so that the client cannot access it for XSS protection
 */
const COOKIE_SETTINGS = {
  transcend_internal_id_token: 'Path=/; Max-Age=604800; Secure;',
  transcend_internal_access_token: 'Path=/; Max-Age=604800; Secure;',
  transcend_internal_refresh_token: 'Path=/; Max-Age=604800; Secure;',
  transcend_internal_scopes: 'Path=/; Max-Age=604800; Secure;',

  transcend_internal_nonce: 'Path=/; Max-Age=604800; Secure; HttpOnly;',
  transcend_internal_pkce: 'Path=/; Max-Age=604800; Secure;',
};
const COOKIE_NAMES = Object.keys(COOKIE_SETTINGS);

/**
 * Returns a map of all cookie names to their values
 *
 * @param headers - The headers on the incoming HTTP request
 * @returns a map of cookie names to values
 */
function parseCookies(headers) {
  const { cookie } = headers;
  if (!cookie) {
    return {};
  }

  // Sometimes the 'cookie' header has multiple values in its array, so we just
  // want to combine their parsed values.
  const parsedCookies = cookie.map(({ value }) => parse(value));
  return parsedCookies.reduce((agg, parsed) => Object.assign(agg, parsed), {});
}

/**
 * Takes in a map of cookie names to the values we want to set on the client's browser,
 * and transforms it into a response header
 *
 * @param cookies - Map of cookie names to their values
 * @returns headers in the Lambda@Edge response format
 */
function createSetCookieHeader(cookies) {
  return Object.entries(cookies)
    .filter(([name]) => COOKIE_NAMES.includes(name))
    .map(([name, value]) => ({
      value: `${name}=${value}; ${COOKIE_SETTINGS[name]}`,
    }));
}

exports.parseCookies = parseCookies;
exports.createSetCookieHeader = createSetCookieHeader;
