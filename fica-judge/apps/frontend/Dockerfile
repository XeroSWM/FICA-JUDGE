FROM nginx:alpine
# Copiamos tu React ya compilado
COPY dist /usr/share/nginx/html
# Copiamos la configuración de rutas
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]