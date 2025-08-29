# Use the official Nginx image to serve static files
FROM nginx:alpine

# Copy website files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY auth-callback.html /usr/share/nginx/html/
COPY privacy.html /usr/share/nginx/html/
COPY terms.html /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
