

CREATE DATABASE IF NOT EXISTS Calendar DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE Calendar;

CREATE TABLE IF NOT EXISTS users (
  id INT(11) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  pass VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS tasks(
  id INT(11) NOT NULL,
  username VARCHAR(50) NOT NULL,
  taskName VARCHAR(50) NOT NULL,
  taskDesc VARCHAR(300),
  taskDate DATE
);

INSERT INTO tasks(id,username,taskName,taskDesc,taskDate) VALUES (2,'test','testowy',"zrobic test jakis",DATE("1999-1-25"));

INSERT INTO users (id, username, pass, email) VALUES (1, 'test', 'test', 'test@test.com');
ALTER TABLE users ADD PRIMARY KEY (id);
ALTER TABLE tasks ADD PRIMARY KEY (id);
ALTER TABLE users MODIFY id int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
ALTER TABLE tasks MODIFY id int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
ALTER TABLE users MODIFY username VARCHAR(50) UNIQUE NOT NULL;
ALTER TABLE users MODIFY pass VARCHAR(300) NOT NULL;
ALTER TABLE tasks RENAME COLUMN taskDescritpion TO taskDesc;

ALTER TABLE users ADD COLUMN username VARCHAR(50) NOT NULL;

ALTER TABLE users DROP COLUMN username;

SELECT taskName,taskDesc,taskDate FROM tasks WHERE username = "mail";

SELECT EXISTS(SELECT username FROM users WHERE username = "mail");

DROP TABLE users;

DELETE FROM tasks WHERE username = "mail";