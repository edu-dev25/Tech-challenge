ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'rootpassword';

CREATE USER IF NOT EXISTS 'dev_user'@'%' 
IDENTIFIED WITH mysql_native_password BY 'dev_password';

GRANT ALL PRIVILEGES ON dev_db.* TO 'dev_user'@'%';

FLUSH PRIVILEGES;