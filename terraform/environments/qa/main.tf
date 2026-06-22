provider "aws" {
  region = var.aws_region
}

# Buscar la última imagen de Ubuntu Jammy de forma dinámica
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# =================================================================
# 1. DESPLIEGUE DEL IAM SERVICE (Con PostgreSQL)
# =================================================================
module "iam_service" {
  source = "../../modules/microservice"

  service_name  = "iam"
  environment   = "qa"
  vpc_id        = aws_vpc.fica_vpc.id
  subnet_ids    = [aws_subnet.fica_subnet_a.id, aws_subnet.fica_subnet_b.id]
  app_sg_id     = aws_security_group.fica_sg.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  # Configuración específica de la App
  app_port      = 3001
  docker_image  = "xxavyx38/fica-iam-service:latest"
  
  # Interruptores de Base de Datos
  requires_rds   = true
  requires_mongo = false
  
  # Credenciales RDS
  db_name       = var.db_name
  db_username   = var.db_username
  db_password   = var.db_password
}

# =================================================================
# 2. DESPLIEGUE DEL PROBLEM CATALOG SERVICE (Con DocumentDB/Mongo)
# =================================================================
module "catalog_service" {
  source = "../../modules/microservice"

  service_name  = "catalog"
  environment   = "qa"
  vpc_id        = aws_vpc.fica_vpc.id
  subnet_ids    = [aws_subnet.fica_subnet_a.id, aws_subnet.fica_subnet_b.id]
  app_sg_id     = aws_security_group.fica_sg.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  # Configuración específica de la App
  app_port      = 3002
  docker_image  = "xxavyx38/problem-catalog-service:latest"
  
  # Interruptores de Base de Datos (Apagamos RDS, Encendemos Mongo)
  requires_rds   = false
  requires_mongo = true
  
  # Credenciales DocumentDB (No usa db_name)
  db_name       = "ficacatalog_qa"
  db_username   = var.db_username
  db_password   = var.db_password
}

# =================================================================
# URLS DE SALIDA DE LOS BALANCEADORES DE CARGA (ALB)
# =================================================================
output "iam_api_url" {
  description = "URL pública balanceada del servicio de Autenticación (IAM)"
  value       = module.iam_service.service_url
}

output "catalog_api_url" {
  description = "URL pública balanceada del Catálogo de Problemas"
  value       = module.catalog_service.service_url
}