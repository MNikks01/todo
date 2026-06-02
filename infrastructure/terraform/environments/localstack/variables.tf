variable "mock_ami_id" {
  type        = string
  default     = "ami-0c55b159cbfafe1f0"
  description = "AMI id for the mock EC2 instance. LocalStack mocks EC2, so any well-formed id works."
}
