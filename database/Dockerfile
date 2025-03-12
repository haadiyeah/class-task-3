FROM postgres:13-alpine

COPY schema.sql /docker-entrypoint-initdb.d/1-schema.sql
COPY init.sql /docker-entrypoint-initdb.d/2-init.sql

EXPOSE 5432