# 1. Grupo de subredes unificado
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "fica-${var.service_name}-db-subnet-${var.environment}"
  subnet_ids = var.subnet_ids
}

# 2. Security Group (Postgres y Mongo)
resource "aws_security_group" "db_sg" {
  name        = "fica-${var.service_name}-db-sg-${var.environment}"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.app_sg_id]
  }
  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [var.app_sg_id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. AMAZON RDS (POSTGRESQL) - Solo se crea si requires_rds es true
resource "aws_db_instance" "microservice_db" {
  count                  = var.requires_rds ? 1 : 0
  identifier             = "fica-${var.service_name}-db-${var.environment}"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
}