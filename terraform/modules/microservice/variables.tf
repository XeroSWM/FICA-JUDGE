variable "service_name" { type = string }
variable "environment"  { type = string }
variable "vpc_id"        { type = string }
variable "subnet_ids"    { type = list(string) }
variable "app_port"      { type = number }
variable "docker_image"  { type = string }
variable "db_name"       { type = string }
variable "db_username"   { type = string }
variable "db_password"   { type = string }
variable "instance_type" { type = string }
variable "ami_id"        { type = string }
variable "app_sg_id"     { type = string }

# ==========================================
# VARIABLES DINÁMICAS PARA EL API GATEWAY
# ==========================================
variable "iam_service_url" { 
  type        = string
  default     = "" 
  description = "URL del balanceador del IAM Service"
}

variable "catalog_service_url" { 
  type        = string
  default     = "" 
  description = "URL del balanceador del Catalog Service"
}

variable "submission_service_url" { 
  type        = string
  default     = "" 
  description = "URL del balanceador del Submission Service"
}

variable "ranking_service_url" { 
  type        = string
  default     = "" 
  description = "URL del balanceador del Ranking Service"
}

variable "assignment_service_url" { 
  type        = string
  default     = "" 
  description = "URL del balanceador del Assignment Service"
}

# ==========================================
# BANDERAS PARA CONTROL DE PERSISTENCIA Y BROKERS
# ==========================================
variable "requires_rds" { 
  description = "Activar si el servicio usa PostgreSQL"
  type        = bool 
  default     = false 
}

variable "requires_mongo" { 
  description = "Activar si el servicio usa MongoDB"
  type        = bool 
  default     = false 
}

variable "requires_redis" {
  description = "Activar si el servicio usa Redis"
  type        = bool
  default     = false
}

variable "requires_rabbitmq" {
  description = "Activar si el servicio usa RabbitMQ"
  type        = bool
  default     = false
}

variable "external_mongo_uri" {
  type        = string
  description = "URI centralizada externa para MongoDB Atlas"
  default     = ""
}