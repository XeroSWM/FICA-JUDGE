# 1. Grupo de subredes unificado
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "fica-${var.service_name}-db-subnet-${var.environment}"
  subnet_ids = var.subnet_ids
}

# Subnet Group dedicado para ElastiCache (Redis)
resource "aws_elasticache_subnet_group" "redis_subnet" {
  count      = var.requires_redis ? 1 : 0
  name       = "fica-${var.service_name}-redis-subnet-${var.environment}"
  subnet_ids = var.subnet_ids
}

# 2. Security Group unificado para todas las bases de datos
resource "aws_security_group" "db_sg" {
  name        = "fica-${var.service_name}-db-sg-${var.environment}"
  vpc_id      = var.vpc_id

  # PostgreSQL
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.app_sg_id]
  }
  
  # MongoDB (Docker en EC2)
  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [var.app_sg_id]
  }

  # Redis
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.app_sg_id]
  }

  # RabbitMQ (Docker en EC2)
  ingress {
    from_port       = 5672
    to_port         = 5672
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

# 3. AMAZON RDS (POSTGRESQL)
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

# 4. AMAZON ELASTICACHE (REDIS)
resource "aws_elasticache_cluster" "redis" {
  count                = var.requires_redis ? 1 : 0
  cluster_id           = "fica-${var.service_name}-redis-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet[0].name
  security_group_ids   = [aws_security_group.db_sg.id]
}