FROM grafana/grafana:11.5.2

# Copy provisioning configs
COPY provisioning/ /etc/grafana/provisioning/

# Copy pre-built dashboards
COPY dashboards/ /var/lib/grafana/dashboards/

# Grafana config overrides
ENV GF_SECURITY_ADMIN_USER=admin
ENV GF_SECURITY_ADMIN_PASSWORD=changeme
ENV GF_USERS_ALLOW_SIGN_UP=false
ENV GF_AUTH_ANONYMOUS_ENABLED=false
ENV GF_SERVER_ROOT_URL=https://grafana.terroirai.com
ENV GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/var/lib/grafana/dashboards/aarrr-pirate-metrics.json

EXPOSE 3000
