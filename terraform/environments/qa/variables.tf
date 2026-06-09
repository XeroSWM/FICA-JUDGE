variable "aws_region" {
  description = "Región de despliegue en AWS"
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Tamaño del servidor para el entorno QA"
  default     = "t3.medium"
}

variable "db_name" {
  description = "Nombre de la base de datos de FICA-JUDGE"
  default     = "ficajudge_qa"
}

variable "db_username" {
  description = "Usuario maestro de PostgreSQL"
  default     = "fica_admin"
}

variable "db_password" {
  description = "Contraseña maestra (Mínimo 8 caracteres)"
  default     = "FicaJudge2026QA" 
  sensitive   = true
}