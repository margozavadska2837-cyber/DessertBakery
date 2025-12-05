FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

# Встановлюємо curl, gnupg та налаштовуємо ключ і репозиторій Microsoft
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /etc/apt/keyrings/microsoft.gpg && \
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && ACCEPT_EULA=Y apt-get install -y mssql-tools18 unixodbc-dev && \
    ln -sfn /opt/mssql-tools18/bin/sqlcmd /usr/bin/sqlcmd && \
    rm -rf /var/lib/apt/lists/*

USER mssql