const { parse } = require("querystring");

/**
 * Finds the authorization code in the querystring of the incoming url, if present.
 *
 * @param request - The incoming HTTP request
 * @returns the authorization code from the url, or undefined if not present
 */
function parseQueryString(request) {
  const { querystring } = request;

  if (!querystring) {
    return undefined;
  }

  const { code, state } = parse(querystring);
  if (!code || !state) {
    return undefined;
  }

  return { code, state };
}

/**
 * Gets the referer to the current page, if one exists.
 *
 * During logins, the referer can include the authorization code
 * that can be exchanged with the oauth server for a JWT.
 *
 * @param headers - The incoming request headers
 * @returns The referer url if present, otherwise undefined
 */
function getReferer(headers) {
  console.log(`IN getReferer with headers:${JSON.stringify(headers)}`);
  const { referer } = headers;

  if (!referer || referer.length === 0) {
    return undefined;
  }

  const refererUrl = referer[0].value;

  const { searchParams } = new URL(refererUrl);
  console.log({ searchParams });
  if (!searchParams.get("code")) {
    return undefined;
  }

  return refererUrl;
}

exports.parseQueryString = parseQueryString;
exports.getReferer = getReferer;
