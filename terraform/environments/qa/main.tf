terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # En una fase posterior, el estado debe guardarse en un bucket S3
  # backend "s3" {}
}

provider "aws" {
  region = var.aws_region
}

# ==========================================
# RED VIRTUAL (VPC) Y SEGURIDAD
# ==========================================
resource "aws_vpc" "fica_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name        = "fica-judge-vpc-qa"
    Environment = "qa"
  }
}

resource "aws_security_group" "fica_sg" {
  name        = "fica-judge-sg-qa"
  description = "Permitir trafico HTTP y SSH"
  vpc_id      = aws_vpc.fica_vpc.id

  ingress {
    description = "Frontend Vite"
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend API"
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
}