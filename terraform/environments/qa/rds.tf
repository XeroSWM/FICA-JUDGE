# 1. Grupo de Subredes para RDS (Alta Disponibilidad)
resource "aws_db_subnet_group" "fica_db_subnet_group" {
  name       = "fica-judge-db-subnet-group-qa"
  subnet_ids = [aws_subnet.fica_subnet_a.id, aws_subnet.fica_subnet_b.id]
  tags = { Name = "fica-judge-db-subnet-group" }
}

# 2. Security Group de la Base de Datos (Blindaje estricto)
resource "aws_security_group" "fica_db_sg" {
  name        = "fica-judge-db-sg-qa"
  description = "Permitir trafico a PostgreSQL SOLO desde los microservicios EC2"
  vpc_id      = aws_vpc.fica_vpc.id

  ingress {
    description     = "Acceso exclusivo desde el SG de las EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    # Aquí enlazamos la seguridad: solo quien tenga el SG de tus EC2 puede entrar
    security_groups = [aws_security_group.fica_sg.id] 
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. Servidor PostgreSQL Administrado (Amazon RDS)
resource "aws_db_instance" "fica_postgres" {
  identifier             = "fica-judge-db-qa"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro" 
  allocated_storage      = 20            
  storage_type           = "gp2"
  
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  
  db_subnet_group_name   = aws_db_subnet_group.fica_db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.fica_db_sg.id]
  
  skip_final_snapshot    = true  # Ideal para QA, permite destruir sin backups
  publicly_accessible    = false # Oculta de internet

  tags = { Name = "fica-judge-postgres-qa" }
}