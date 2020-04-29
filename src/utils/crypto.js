const { createHash, randomBytes } = require('crypto');
const { encode } = require('urlsafe-base64');

const SECRET_ALLOWED_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/**
 * Returns a random value
 *
 * @returns a randomly selected character that are allowed in OAUTH secrets
 */
function randomSecretChar() {
  const chunks = Math.floor(256 / SECRET_ALLOWED_CHARS.length);
  let randomNumber;
  do {
    [randomNumber] = randomBytes(1);
  } while (randomNumber >= SECRET_ALLOWED_CHARS.length * chunks);
  const index = randomNumber % SECRET_ALLOWED_CHARS.length;
  return SECRET_ALLOWED_CHARS[index];
}

/**
 * Generates a PKCE verifier to prevent authorization code injection attacks
 *
 * @returns a pkce value and its hash
 */
function generatePkceVerifier() {
  const pkce = [...new Array(128)].map(randomSecretChar).join('');
  return {
    pkce,
    pkceHash: encode(
      createHash('sha256').update(pkce, 'utf8').digest('base64'),
    ),
  };
}

/**
 * Creates a nonce to use in PKCE verification
 *
 * @returns a randomly generated nonce
 */
function generateNonce() {
  return [...new Array(64)].map(randomSecretChar).join('');
}

exports.generatePkceVerifier = generatePkceVerifier;
exports.generateNonce = generateNonce;
