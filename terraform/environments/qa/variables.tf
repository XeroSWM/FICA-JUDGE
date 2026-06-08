variable "aws_region" {
  description = "Región de despliegue en AWS"
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Tamaño del servidor para el entorno QA"
  default     = "t3.medium"
}