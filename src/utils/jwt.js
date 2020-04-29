const axios = require('axios').default;
const jwkToPem = require('jwk-to-pem');
const { decode, verify } = require('jsonwebtoken');
const { promisify } = require('util');

const { ISSUER } = require('./config');
const { logger } = require('./logger');

const jwtVerify = promisify(verify);

/**
 * Finds the public keys for the Cognito User Pool.
 *
 * These are used to verify the JWT. The header of the JWT has a key id (kid) that should
 * be present in the resulting map.
 *
 * @returns A map of key ids to their public keys in PEM format
 */
async function getPublicKeys() {
  const url = `${ISSUER}/.well-known/jwks.json`;
  const publicKeys = await axios.get(url);
  return publicKeys.data.keys.reduce((agg, current) => {
    const pem = jwkToPem(current);
    // eslint-disable-next-line no-param-reassign
    agg[current.kid] = { instance: current, pem };
    return agg;
  }, {});
}

/**
 * Validates a JWT.
 *
 * - If the JWT is valid, it returns 'success'
 * - If the JWT is valid but expired, it returns 'expired'
 * - If the JWT is invalid, it returns 'invalid'
 *
 * @param token - The access token JWT from AWS Cognito
 * @returns 'success', 'invalid', or 'expired' depending on the status of the JWT
 */
async function validateToken(token) {
  // Fail if the token is not jwt
  const decodedJwt = decode(token, { complete: true });
  if (!decodedJwt) {
    logger.error('Not a valid JWT token');
    return 'invalid';
  }

  // Fail if token is not from your UserPool
  if (decodedJwt.payload.iss !== ISSUER) {
    logger.error(
      `JWT is not from the expected user pool. Issuer was ${decodedJwt.payload.iss}`,
    );
    return 'invalid';
  }

  // Get the kid from the token and retrieve corresponding PEM
  const { kid } = decodedJwt.header;
  const pemMap = await getPublicKeys();
  const { pem } = pemMap[kid];
  if (!pem) {
    logger.error('Invalid id token. Could not find matching public key');
    return 'invalid';
  }

  try {
    await jwtVerify(token, pem, { issuer: ISSUER });
  } catch (err) {
    logger.warn(err);

    if (err.name === 'TokenExpiredError') {
      return 'expired';
    }
    return 'invalid';
  }

  return 'success';
}

exports.getPublicKeys = getPublicKeys;
exports.validateToken = validateToken;
