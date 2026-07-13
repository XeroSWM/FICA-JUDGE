# =================================================================
# 1. Balanceador de Carga
# =================================================================
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

# =================================================================
# 2. Plantilla de Instancia y Docker
# =================================================================
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
              
              # Esperar 10 segundos a que el demonio de Docker se levante por completo
              sleep 10

              # Levantar RabbitMQ localmente si se requiere
              if [ "${var.requires_rabbitmq}" == "true" ]; then
                docker run -d -p 5672:5672 -p 15672:15672 --name fica-rabbitmq --restart unless-stopped rabbitmq:3-management
              fi

              # AUTOMATIZACIÓN: Crear imagen local de Python para el evaluador si es el servicio de entregas (submission)
              if [ "${var.service_name}" == "submission" ]; then
                mkdir -p /tmp/py-compiler
                cat <<'OUTER_EOF' > /tmp/py-compiler/Dockerfile
              FROM python:3.9-slim
              CMD ["python3"]
              OUTER_EOF
                
                # Construir la imagen localmente asegurando que Docker ya responda
                docker build -t fica-comp-python.v2:latest /tmp/py-compiler/
              fi
              
              # Correr el contenedor de Node mapeando las conexiones dinámicamente desde Terraform
              docker run -d -p ${var.app_port}:${var.app_port} --name fica-${var.service_name}-service --restart unless-stopped \
                -v /var/run/docker.sock:/var/run/docker.sock \
                -v /tmp:/tmp \
                -e DB_HOST="${try(aws_db_instance.microservice_db[0].address, "")}" \
                -e DB_PORT=5432 \
                -e DB_USERNAME="${var.db_username}" \
                -e DB_PASSWORD="${var.db_password}" \
                -e DB_NAME="${var.db_name}" \
                -e MONGO_URI="${var.external_mongo_uri != "" ? var.external_mongo_uri : (var.requires_mongo ? "mongodb://${var.db_username}:${var.db_password}@172.17.0.1:27017/${var.db_name}?authSource=admin" : "")}" \
                -e REDIS_HOST="${try(aws_elasticache_cluster.redis[0].cache_nodes[0].address, "")}" \
                -e REDIS_PORT=6379 \
                -e RABBITMQ_URL="${var.requires_rabbitmq ? "amqp://guest:guest@172.17.0.1:5672" : ""}" \
                -e PORT=${var.app_port} \
                -e IAM_SERVICE_URL="${var.iam_service_url}" \
                -e CATALOG_SERVICE_URL="${var.catalog_service_url}" \
                -e SUBMISSION_SERVICE_URL="${var.submission_service_url}" \
                -e RANKING_SERVICE_URL="${var.ranking_service_url}" \
                -e ASSIGNMENT_SERVICE_URL="${var.assignment_service_url}" \
                ${var.docker_image}
              EOF
  )
}

# =================================================================
# 3. Grupo de Autoescalado
# =================================================================
resource "aws_autoscaling_group" "asg" {
  name                = "fica-${var.service_name}-asg-${var.environment}"
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1
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