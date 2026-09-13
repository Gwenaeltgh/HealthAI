-- Creates separate databases for RGPD separation.
-- Note: scripts in docker-entrypoint-initdb.d only run on FIRST init of the MySQL datadir.

CREATE DATABASE IF NOT EXISTS `healthia_api` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `healthia` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant rights to the application user (MYSQL_USER / MYSQL_PASSWORD).
-- The docker mysql image creates the user from env vars, so we only grant privileges here.
GRANT ALL PRIVILEGES ON `healthia_api`.* TO 'healthia'@'%';
GRANT ALL PRIVILEGES ON `healthia`.* TO 'healthia'@'%';
FLUSH PRIVILEGES;
