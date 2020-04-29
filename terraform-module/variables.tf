variable name {
  description = "The name of the lambda@edge function"
  default     = "cognito_auth"
}

variable description {
  description = "The description of the lambda@edge function"
  default     = "Enforces JWT authentication through AWS Cognito"
}

variable userpool_id {
  description = "The ID of the Cognito User Pool to validate JWTs with"
}

variable client_id {
  description = "THe ID of the Cognito User Pool App Client to validate JWTs with"
}

variable client_secret {
  description = "The Client Secret of the Cognito User Pool App Client to validate JWTs with"
}

variable userpool_region {
  description = "The region of the Cognito User Pool"
  default     = "eu-west-1"
}

variable ui_subdomain {
  description = "The subdomain used for the Amazon Cognito user pool UI"
}

variable scopes {
  type        = list(string)
  description = "The scopes to attempt to log in with"
}