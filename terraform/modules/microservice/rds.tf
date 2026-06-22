resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "fica-${var.service_name}-db-subnet-${var.environment}"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "db_sg" {
  name        = "fica-${var.service_name}-db-sg-${var.environment}"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.app_sg_id] # Solo permite tráfico desde tus EC2
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "microservice_db" {
  identifier             = "fica-${var.service_name}-db-${var.environment}"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_type           = "gp2"
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = false
}