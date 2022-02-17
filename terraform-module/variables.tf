variable "name" {
  description = "The name of the lambda@edge function"
  default     = "cognito-auth-lambda"
}

variable "description" {
  description = "The description of the lambda@edge function"
  default     = "Enforces JWT authentication through AWS Cognito"
}

variable "userpool_id" {
  description = "The ID of the Cognito User Pool to validate JWTs with"
}

variable "client_id" {
  description = "THe ID of the Cognito User Pool App Client to validate JWTs with"
}

# variable client_secret {
#   description = "The Client Secret of the Cognito User Pool App Client to validate JWTs with"
# }

variable "userpool_region" {
  description = "The region of the Cognito User Pool"
  default     = "us-west-2"
}

variable "ui_subdomain" {
  description = "The subdomain used for the Amazon Cognito user pool UI"
}

variable "scopes" {
  type        = list(string)
  description = "The scopes to attempt to log in with"
}

# variable ssm_client_secret_param_name {
#   description = "The name of the SSM param for the client secret"
#   default = "COGNITO_CLIENT_SECRET"
# }

variable "s3_artifact_bucket" {}
