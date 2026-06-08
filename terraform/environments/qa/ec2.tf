resource "aws_instance" "fica_server" {
  ami           = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS (us-east-1)
  instance_type = "t3.medium"             # Capacidad para correr BDs y Backend
  
  vpc_security_group_ids = [aws_security_group.fica_sg.id]
  
  # Script de inicialización (User Data)
  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y apt-transport-https ca-certificates curl software-properties-common
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
              add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
              apt-get update -y
              apt-get install -y docker-ce docker-compose
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
              EOF

  tags = {
    Name        = "fica-judge-server-qa"
    Environment = "qa"
  }
}

output "public_ip" {
  description = "IP Publica del servidor QA"
  value       = aws_instance.fica_server.public_ip
}