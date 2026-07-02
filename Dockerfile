# ---------- Etapa 1: build de Vite ----------
FROM node:20-alpine AS build

WORKDIR /app

# URL del backend embebida en el bundle en tiempo de build.
# En OpenShift, definirla como build-arg apuntando a la Route del backend, ej:
#   VITE_API_URL=https://reciapp-backend-miproyecto.apps.midominio.com
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
# --legacy-peer-deps: el repo tiene un conflicto de peers preexistente
# (vite 8 vs @vitejs/plugin-react, que declara soporte hasta vite 7).
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ---------- Etapa 2: servir estáticos con Nginx (no-root) ----------
# Imagen unprivileged: escucha en 8080 y corre sin root, compatible con el
# UID arbitrario del namespace que asigna OpenShift.
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Config de SPA (fallback a index.html para el router de React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Bundle compilado
COPY --from=build /app/dist /usr/share/nginx/html

# Permisos de grupo root (GID 0) para que cualquier UID arbitrario pueda
# operar los directorios que Nginx necesita escribir.
USER root
RUN chgrp -R 0 /usr/share/nginx/html /var/cache/nginx /etc/nginx/conf.d \
    && chmod -R g=u /usr/share/nginx/html /var/cache/nginx /etc/nginx/conf.d
USER 101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
