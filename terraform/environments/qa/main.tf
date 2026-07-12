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
# 1. API GATEWAY (Enrutador Principal)
# =================================================================
module "api_gateway" {
  source = "../../modules/microservice"

  service_name  = "api-gateway"
  environment   = "qa"
  vpc_id        = aws_vpc.fica_vpc.id
  subnet_ids    = [aws_subnet.fica_subnet_a.id, aws_subnet.fica_subnet_b.id]
  app_sg_id     = aws_security_group.fica_sg.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  app_port      = 3000
  docker_image  = "xxavyx38/api-gateway:latest"
  
  # 👇 INYECCIÓN DINÁMICA DE RUTAS 👇
  iam_service_url        = "http://${module.iam_service.service_url}/auth"
  catalog_service_url    = "http://${module.catalog_service.service_url}/problems"
  submission_service_url = "http://${module.submission_service.service_url}/submissions"
  ranking_service_url    = "http://${module.ranking_service.service_url}/ranking"
  assignment_service_url = "http://${module.assignment_service.service_url}/assignments"
  
  # El Gateway solo enruta, no necesita BD propia
  requires_rds      = false
  requires_mongo    = false
  requires_redis    = false
  requires_rabbitmq = false
  
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
}

# =================================================================
# 2. IAM SERVICE (Autenticación y Perfiles)
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

  app_port      = 3001
  docker_image  = "xxavyx38/iam-service:latest"
  
  # Requiere Postgres (Usuarios) y Redis (Sesiones JWT)
  requires_rds      = true
  requires_mongo    = false
  requires_redis    = true
  requires_rabbitmq = false
  
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
}

# =================================================================
# 3. PROBLEM CATALOG SERVICE (Gestión de Problemas)
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

  app_port      = 3002
  docker_image  = "xxavyx38/problem-catalog-service:latest"
  
  # Requiere Mongo (JSONs de problemas y casos de prueba)
  requires_rds      = false
  requires_mongo    = true
  requires_redis    = false
  requires_rabbitmq = false
  
  db_name     = "ficacatalog_qa"
  db_username = var.db_username
  db_password = var.db_password
}

# =================================================================
# 4. RANKING SERVICE (Tablas de Posiciones)
# =================================================================
module "ranking_service" {
  source = "../../modules/microservice"

  service_name  = "ranking"
  environment   = "qa"
  vpc_id        = aws_vpc.fica_vpc.id
  subnet_ids    = [aws_subnet.fica_subnet_a.id, aws_subnet.fica_subnet_b.id]
  app_sg_id     = aws_security_group.fica_sg.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  app_port      = 3004
  docker_image  = "xxavyx38/ranking-service:latest"
  
  # Requiere Postgres (Historial) y Redis (Leaderboard en tiempo real)
  requires_rds      = true
  requires_mongo    = false
  requires_redis    = true
  requires_rabbitmq = false
  
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
}

# =================================================================
# 5. SUBMISSION SERVICE (Motor de Envíos al Sandbox)
# =================================================================
module "submission_service" {
  source = "../../modules/microservice"

  service_name  = "submission"
  environment   = "qa"
  vpc_id        = aws_vpc.fica_vpc.id
  subnet_ids    = [aws_subnet.fica_subnet_a.id, aws_subnet.fica_subnet_b.id]
  app_sg_id     = aws_security_group.fica_sg.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  app_port      = 3003
  docker_image  = "xxavyx38/submission-service:latest"
  
  # Requiere Postgres (Historial de envíos) y RabbitMQ (Cola para Docker)
  requires_rds      = true
  requires_mongo    = false
  requires_redis    = false
  requires_rabbitmq = true
  
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
}

# =================================================================
# 6. ASSIGNMENT SERVICE (Deberes y Exámenes)
# =================================================================
module "assignment_service" {
  source = "../../modules/microservice"

  service_name  = "assignment"
  environment   = "qa"
  vpc_id        = aws_vpc.fica_vpc.id
  subnet_ids    = [aws_subnet.fica_subnet_a.id, aws_subnet.fica_subnet_b.id]
  app_sg_id     = aws_security_group.fica_sg.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  app_port      = 3005
  docker_image  = "xxavyx38/assignment-service:latest"
  
  # Requiere Postgres (Gestión de fechas, notas y reglas del examen)
  requires_rds      = true
  requires_mongo    = false
  requires_redis    = false
  requires_rabbitmq = false
  
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
}

# =================================================================
# 7. FRONTEND SERVICE (React + Nginx)
# =================================================================
module "frontend_service" {
  source = "../../modules/microservice"

  service_name  = "frontend"
  environment   = "qa"
  vpc_id        = aws_vpc.fica_vpc.id
  subnet_ids    = [aws_subnet.fica_subnet_a.id, aws_subnet.fica_subnet_b.id]
  app_sg_id     = aws_security_group.fica_sg.id
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  app_port      = 80
  docker_image  = "xxavyx38/fica-frontend:latest"
  
  # El frontend solo sirve estáticos, no necesita bases de datos
  requires_rds      = false
  requires_mongo    = false
  requires_redis    = false
  requires_rabbitmq = false
  
  # Llenamos las variables obligatorias del módulo con texto dummy
  db_name     = "none"
  db_username = "none"
  db_password = "none"
}

# =================================================================
# URLS DE SALIDA DE LOS BALANCEADORES DE CARGA (ALB)
# =================================================================
output "api_gateway_url" {
  description = "URL principal de entrada (API Gateway)"
  value       = module.api_gateway.service_url
}

output "iam_api_url" {
  description = "URL del servicio de Autenticación (IAM)"
  value       = module.iam_service.service_url
}

output "catalog_api_url" {
  description = "URL del Catálogo de Problemas"
  value       = module.catalog_service.service_url
}

output "ranking_api_url" {
  description = "URL del Servicio de Rankings"
  value       = module.ranking_service.service_url
}

output "submission_api_url" {
  description = "URL del Servicio de Entregas (Submissions)"
  value       = module.submission_service.service_url
}

output "assignment_api_url" {
  description = "URL del Servicio de Evaluaciones (Assignments)"
  value       = module.assignment_service.service_url
}

output "frontend_url_definitiva" {
  description = "URL publica de la aplicacion React (Tu nueva puerta de entrada)"
  value       = module.frontend_service.service_url
}