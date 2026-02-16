FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# SSG output goes to dist/terroir-ai/browser/
# Prerendered HTML files are already inside browser/

FROM nginx:alpine
# Copy prerendered static site
COPY --from=builder /app/dist/terroir-ai/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
