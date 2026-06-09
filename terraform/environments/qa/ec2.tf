data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# 1. Balanceador de Carga (ALB)
resource "aws_lb" "fica_alb" {
  name               = "fica-judge-alb-qa"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.fica_sg.id]
  subnets            = [aws_subnet.fica_subnet_a.id, aws_subnet.fica_subnet_b.id]
  tags = {
    Name = "fica-judge-alb-qa"
  }
}

resource "aws_lb_target_group" "fica_tg" {
  name     = "fica-judge-tg-qa"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = aws_vpc.fica_vpc.id
  health_check {
    path                = "/"
    port                = "3001"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    interval            = 30
  }
}

resource "aws_lb_listener" "fica_listener" {
  load_balancer_arn = aws_lb.fica_alb.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.fica_tg.arn
  }
}

# 2. Plantilla de Servidor (Launch Template)
resource "aws_launch_template" "fica_lt" {
  name_prefix   = "fica-judge-node-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  vpc_security_group_ids = [aws_security_group.fica_sg.id]

  user_data = base64encode(<<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              systemctl start docker
              systemctl enable docker
              
              # Terraform inyectará dinámicamente la URL secreta de RDS aquí
              docker run -d -p 3001:3001 --name fica-iam-service --restart unless-stopped \
                -e DB_HOST=${aws_db_instance.fica_postgres.address} \
                -e DB_PORT=5432 \
                -e DB_USERNAME=${var.db_username} \
                -e DB_PASSWORD=${var.db_password} \
                -e DB_NAME=${var.db_name} \
                xxavyx38/fica-iam-service:latest
              EOF
  )

  tags = {
    Name = "fica-judge-lt-qa"
  }
}

# 3. Grupo de Autoescalado (HA) con propagación de nombres activada
resource "aws_autoscaling_group" "fica_asg" {
  name                = "fica-judge-asg-qa"
  desired_capacity    = 2
  max_size            = 2
  min_size            = 2
  vpc_zone_identifier = [aws_subnet.fica_subnet_a.id, aws_subnet.fica_subnet_b.id]
  target_group_arns   = [aws_lb_target_group.fica_tg.arn]

  launch_template {
    id      = aws_launch_template.fica_lt.id
    version = "$Latest"
  }

  # Forzar a la fábrica del ASG a nombrar las instancias en el despliegue
  tag {
    key                 = "Name"
    value               = "fica-judge-node-qa"
    propagate_at_launch = true
  }

  tag {
    key                 = "Project"
    value               = "FICA-JUDGE"
    propagate_at_launch = true
  }
}

# 4. Enlace Público Final
output "alb_dns_name" {
  description = "La URL pública de tu plataforma balanceada"
  value       = aws_lb.fica_alb.dns_name
}