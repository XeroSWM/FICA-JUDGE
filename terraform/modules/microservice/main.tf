# 1. Balanceador de Carga
resource "aws_lb" "alb" {
  name               = "fica-${var.service_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.app_sg_id]
  subnets            = var.subnet_ids
}

resource "aws_lb_target_group" "tg" {
  name     = "fica-${var.service_name}-tg-${var.environment}"
  port     = var.app_port
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  health_check {
    path                = "/"
    port                = var.app_port
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    interval            = 30
  }
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_lb.alb.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

# 2. Plantilla de Instancia y Docker
resource "aws_launch_template" "lt" {
  name_prefix   = "fica-${var.service_name}-node-"
  image_id      = var.ami_id
  instance_type = var.instance_type
  vpc_security_group_ids = [var.app_sg_id]

  user_data = base64encode(<<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              systemctl start docker
              systemctl enable docker
              
              docker run -d -p ${var.app_port}:${var.app_port} --name fica-${var.service_name}-service --restart unless-stopped \
                -e DB_HOST=${aws_db_instance.microservice_db.address} \
                -e DB_PORT=5432 \
                -e DB_USERNAME=${var.db_username} \
                -e DB_PASSWORD=${var.db_password} \
                -e DB_NAME=${var.db_name} \
                -e PORT=${var.app_port} \
                ${var.docker_image}
              EOF
  )
}

# 3. Grupo de Autoescalado
resource "aws_autoscaling_group" "asg" {
  name                = "fica-${var.service_name}-asg-${var.environment}"
  desired_capacity    = 2
  max_size            = 2
  min_size            = 2
  vpc_zone_identifier = var.subnet_ids
  target_group_arns   = [aws_lb_target_group.tg.arn]

  launch_template {
    id      = aws_launch_template.lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "fica-${var.service_name}-node-${var.environment}"
    propagate_at_launch = true
  }
}

output "service_url" {
  value = aws_lb.alb.dns_name
}