const { createSetCookieHeader } = require('./cookies');

/**
 * Creates an HTTP response for when the user is unauthorized.
 *
 * @param message - The reason the request failed
 * @returns an HTTP response
 */
function reject(message) {
  return {
    status: '401',
    statusDescription: 'Unauthorized',
    body: `
      <img src="https://media.giphy.com/media/kKqD4MXwZggMg/giphy.gif" />
      <p>${message}</p>
    `,
    bodyEncoding: 'text',
    headers: {
      'content-type': [
        {
          value: 'text/html',
        },
      ],
    },
  };
}

/**
 * Creates an HTTP response for redirecting a user to another url.
 *
 * Cookies can be set on the client browser
 *
 * @param destination - The destination to send the user to
 * @param cookies - A map of cookies to set
 * @returns an HTTP response
 */
function redirect(destination, cookies = {}) {
  const headers = {
    location: [{ value: destination }],
  };

  const cookieHeader = createSetCookieHeader(cookies);
  if (cookieHeader.length > 0) {
    headers['set-cookie'] = cookieHeader;
  }

  return {
    status: '302',
    statusDescription: 'Moved Temporarily',
    headers,
  };
}

exports.reject = reject;
exports.redirect = redirect;
