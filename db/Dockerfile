FROM postgres:15.3


# Copy the database initialization script.
# all scripts in /docker-entrypoint-initdb.d will get executed.
ADD container-content/* /docker-entrypoint-initdb.d

