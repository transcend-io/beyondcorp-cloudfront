module "lambda-at-edge" {
  source  = "transcend-io/lambda-at-edge/aws"
  version = "0.0.1"

  lambda_code_source_dir = "${path.module}/../src"
  file_globs = [
    "index.js",
    "handle*.js",
    "utils/*.js",
    "node_modules/**",
    "yarn.lock",
    "package.json",
  ]

  plaintext_params = {
    userpool_id     = var.userpool_id
    client_id       = var.client_id
    userpool_region = var.userpool_region
    ui_subdomain    = var.ui_subdomain
    scopes          = join(" ", var.scopes)
  }

  ssm_params = {
    COGNITO_CLIENT_SECRET = var.client_secret
  }

  # All Lambda@Edge functions must be in us-east-1 (Virginia)
  region      = "us-east-1"
}