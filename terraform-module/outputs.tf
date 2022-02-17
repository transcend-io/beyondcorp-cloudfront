output "arn" {
  value       = module.lambda-at-edge.arn
  description = "The arn of the lambda function"
}

output "filepath" {
  value       = "${path.module}/../src"
  description = "The path to the files where the lambda function are"
}
