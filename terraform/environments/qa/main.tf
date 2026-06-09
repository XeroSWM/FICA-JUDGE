provider "aws" {
  region = var.aws_region
}

# 1. Red Principal (VPC)
resource "aws_vpc" "fica_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name    = "fica-judge-vpc-qa"
    Project = "FICA-JUDGE"
  }
}

resource "aws_internet_gateway" "fica_igw" {
  vpc_id = aws_vpc.fica_vpc.id
  tags = {
    Name = "fica-judge-igw-qa"
  }
}

# 2. Zonas de Alta Disponibilidad (Dos Subredes)
resource "aws_subnet" "fica_subnet_a" {
  vpc_id                  = aws_vpc.fica_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"
  tags = {
    Name = "fica-judge-subnet-qa-a"
  }
}

resource "aws_subnet" "fica_subnet_b" {
  vpc_id                  = aws_vpc.fica_vpc.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}b"
  tags = {
    Name = "fica-judge-subnet-qa-b"
  }
}

# 3. Tablas de Rutas
resource "aws_route_table" "fica_rt" {
  vpc_id = aws_vpc.fica_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.fica_igw.id
  }
  tags = {
    Name = "fica-judge-rt-qa"
  }
}

resource "aws_route_table_association" "fica_rta_a" {
  subnet_id      = aws_subnet.fica_subnet_a.id
  route_table_id = aws_route_table.fica_rt.id
}

resource "aws_route_table_association" "fica_rta_b" {
  subnet_id      = aws_subnet.fica_subnet_b.id
  route_table_id = aws_route_table.fica_rt.id
}

# 4. Security Group Unificado
resource "aws_security_group" "fica_sg" {
  name        = "fica-judge-sg-qa"
  description = "Permitir trafico HA para FICA-JUDGE"
  vpc_id      = aws_vpc.fica_vpc.id

  ingress {
    description = "HTTP Balanceador"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "IAM Service API"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fica-judge-sg-qa"
  }
}