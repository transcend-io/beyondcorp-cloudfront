const { logger } = require("./utils/logger");
const { validateToken } = require("./utils/jwt");
const { reject } = require("./utils/response");

const { handleNoAuth } = require("./handleNoAuth");

/**
 * Handles the case where the user already has a cookie containing a JWT.
 *
 * @param token - The JWT stored in the cookie
 * @param redirectUri - The URI that Cognito should redirect to on successful authentication
 * @param requestedUri - The content page the user is eventually trying to reach
 * @param request - The HTTP request.
 * @returns an HTTP response
 */
exports.handleCookies = async (token, redirectUri, requestedUri, request) => {
  const result = await validateToken(token);

  // If the JWT in the cookie is valid, just return the original request, which will load content from
  // the origin bucket.
  if (result === "success") {
    logger.info("Valid JWT was found in cookie, passing on the request");
    return request;
  }

  if (result === "expired") {
    return handleNoAuth(redirectUri, requestedUri);
  }

  return reject("Failed to validate JWT");
};
