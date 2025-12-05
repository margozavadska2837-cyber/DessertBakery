echo "Waiting for SQL Server..."
until /opt/mssql-tools18/bin/sqlcmd -S food-catalog-db -U sa -P 'YourStrong_Passw0rd1' -Q 'SELECT 1'; do
  >&2 echo "SQL Server is unavailable - sleeping"
  sleep 5
done
>&2 echo "SQL Server is up - executing command"
exec "$@"