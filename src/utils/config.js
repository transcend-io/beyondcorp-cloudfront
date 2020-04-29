const { SSM } = require('aws-sdk');

const { readFileSync } = require('fs');

// All Lambda@Edge functions must reside in us-east-1.
const ssmClient = new SSM({ region: 'us-east-1' });

// Executing this at the top level caches the config between lambda runs on the same server
const config = JSON.parse(readFileSync('./config.json'));

/**
 * Fetches a decrypted parameter from AWS SSM Parameter Store
 *
 * @param name - The name of the parameter to fetch
 * @returns the decrypted value of the parameter
 */
async function fetchSsmParam(name) {
  const { Parameter } = await ssmClient
    .getParameter({
      Name: name,
      WithDecryption: true,
    })
    .promise();
  return Parameter.Value;
}

exports.fetchSsmParam = fetchSsmParam;
exports.USERPOOL_ID = config.userpool_id;
exports.CLIENT_ID = config.client_id;
exports.CLIENT_SECRET_PARAM_NAME = config.client_secret_param_name;
exports.REGION = config.userpool_region;
exports.UI_SUBDOMAIN = config.ui_subdomain;
exports.SCOPES = config.scopes;
exports.ISSUER = `https://cognito-idp.${config.userpool_region}.amazonaws.com/${config.userpool_id}`;
exports.AUTH_DOMAIN = `https://${config.ui_subdomain}.auth.${config.userpool_region}.amazoncognito.com`;
