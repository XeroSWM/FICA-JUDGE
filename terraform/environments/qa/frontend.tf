# 1. Generar un sufijo aleatorio (Los nombres en S3 deben ser únicos a nivel mundial)
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# 2. Crear el Bucket S3
resource "aws_s3_bucket" "fica_frontend" {
  bucket        = "fica-judge-frontend-qa-${random_id.bucket_suffix.hex}"
  force_destroy = true # Permite destruir el bucket aunque tenga archivos dentro
}

# 3. Configurar el Bucket como un Servidor Web Estático
resource "aws_s3_bucket_website_configuration" "fica_frontend_website" {
  bucket = aws_s3_bucket.fica_frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html" # Crucial para que React Router funcione correctamente
  }
}

# 4. Desbloquear el acceso público
resource "aws_s3_bucket_public_access_block" "fica_frontend_public_access" {
  bucket = aws_s3_bucket.fica_frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# 5. Política de Seguridad: Permitir que cualquiera lea los archivos (Public Read)
resource "aws_s3_bucket_policy" "fica_frontend_policy" {
  bucket = aws_s3_bucket.fica_frontend.id
  depends_on = [aws_s3_bucket_public_access_block.fica_frontend_public_access]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.fica_frontend.arn}/*"
      },
    ]
  })
}

# 6. Enlaces Finales
output "frontend_bucket_name" {
  description = "El nombre de tu bucket"
  value       = aws_s3_bucket.fica_frontend.id
}

output "frontend_website_url" {
  description = "La URL pública donde verás tu Frontend"
  value       = aws_s3_bucket_website_configuration.fica_frontend_website.website_endpoint
}