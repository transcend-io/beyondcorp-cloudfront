module "lambda-at-edge" {
  source  = "transcend-io/lambda-at-edge/aws"
  version = "0.4.0"

  name        = var.name
  description = var.description

  s3_artifact_bucket = var.s3_artifact_bucket

  runtime = "nodejs14.x"

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
    userpool_id              = var.userpool_id
    client_id                = var.client_id
    userpool_region          = var.userpool_region
    ui_subdomain             = var.ui_subdomain
    scopes                   = join(" ", var.scopes)
    client_secret_param_name = var.ssm_client_secret_param_name
  }

  ssm_params = {
    (var.ssm_client_secret_param_name) = var.client_secret
  }
}