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

# 4. Security Group Unificado (Maneja el tráfico de toda la plataforma)
resource "aws_security_group" "fica_sg" {
  name        = "fica-judge-sg-qa"
  description = "Permitir trafico HA para FICA-JUDGE"
  vpc_id      = aws_vpc.fica_vpc.id

  # Tráfico HTTP desde Internet hacia los Balanceadores de Carga
  ingress {
    description = "HTTP Balanceador"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Abrimos el rango completo para todos los Microservicios (3000 a 3005)
  ingress {
    description = "Puertos de la Flota de Microservicios Node.js"
    from_port   = 3000
    to_port     = 3005
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # 🟢 NUEVA REGLA: Permitir conexión a RabbitMQ desde otros microservicios/pods
  ingress {
    description = "RabbitMQ y Panel de Administracion"
    from_port   = 5672
    to_port     = 15672
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Acceso Administrativo (Opcional, se recomienda restringir a tu IP real en Producción)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Salida libre a Internet (Para que Docker pueda descargar las imágenes)
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