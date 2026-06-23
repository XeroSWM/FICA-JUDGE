variable "service_name" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "app_port" { type = number }
variable "docker_image" { type = string }
variable "db_name" { type = string }
variable "db_username" { type = string }
variable "db_password" { type = string }
variable "instance_type" { type = string }
variable "ami_id" { type = string }
variable "app_sg_id" { type = string }

# ==========================================
# NUEVAS VARIABLES PARA CONTROL DE BASE DE DATOS
# ==========================================
variable "requires_rds" { 
  description = "Activar para crear PostgreSQL en RDS"
  type        = bool 
  default     = true 
}

variable "requires_mongo" { 
  description = "Activar para crear MongoDB en DocumentDB"
  type        = bool 
  default     = false 
}