DROP DATABASE IF EXISTS sunTrack;
CREATE DATABASE sunTrack;
USE sunTrack;

-- user roles
CREATE TABLE user_types (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(64) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO user_types (title) VALUES ("Admin"), ("Worker"), ("Manager");

-- vehicles table first, since users references it
CREATE TABLE vehicles (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(64),
  nickname VARCHAR(64) UNIQUE,
  make VARCHAR(64),
  model VARCHAR(64),
  year YEAR,
  license_plate VARCHAR(64) UNIQUE,
  imei VARCHAR(64) UNIQUE,
  isArchived TINYINT(1) DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- user information
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  user_type INT DEFAULT 2,
  name VARCHAR(64),
  email VARCHAR(64) NOT NULL UNIQUE,
  phone_number VARCHAR(64) NULL UNIQUE,
  clockedIn TINYINT(1) DEFAULT 0,
  recent_location VARCHAR(255),
  lat DECIMAL(10, 6),
  lon DECIMAL(10, 6),
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  public_key VARCHAR(255),
  authentication_token VARCHAR(255),
  isArchived TINYINT(1) DEFAULT 0,
  vehicle_assignment INT NULL,
  FOREIGN KEY (user_type) REFERENCES user_types(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (vehicle_assignment) REFERENCES vehicles(id) ON DELETE SET NULL ON UPDATE CASCADE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (user_type, name, email) VALUES (1, "Johnny", "lindberghjohnny@gmail.com");

CREATE TABLE jobs (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(64),
  address VARCHAR(255),
  lat DECIMAL(10, 6),
  lon DECIMAL(10, 6),
  isArchived TINYINT(1) DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

insert into jobs (name, address, lat, lon) values ("Job 1", "123 Main St", 40.7128, -74.0060);

CREATE TABLE job_assignments (
  id INT NOT NULL AUTO_INCREMENT,
  job_id INT,
  user_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO job_assignments (job_id, user_id) VALUES (1, 1);


CREATE TABLE timesheet (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT,
  job_id INT,
  clock_in DATETIME,
  clock_out DATETIME,
  duration INT,  -- store duration in seconds (integer)
  notes VARCHAR(255),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO timesheet (user_id, job_id, clock_in, clock_out, duration, notes) VALUES (1, 1, '2021-01-01 08:00:00', '2021-01-01 16:00:00', 8.1, 'worked 8 hours');

CREATE TABLE vehicle_location (
  id INT NOT NULL AUTO_INCREMENT,
  vehicle_id INT,
  lat DECIMAL(10, 6),
  lon DECIMAL(10, 6),
  time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE daily_log (
  id INT NOT NULL AUTO_INCREMENT,
  job_id INT,
  date DATE,
  questions TEXT,
  banner_image VARCHAR(255),
  PRIMARY KEY (id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY (job_id, date)  -- optional, if you want only one daily log per job per date
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE daily_log_notes (
  id INT NOT NULL AUTO_INCREMENT,
  daily_log_id INT,
  user_id INT,
  weather_condition VARCHAR(64),
  temperature INT,
  note VARCHAR(255),
  time DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (daily_log_id) REFERENCES daily_log(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE daily_log_images (
  id INT NOT NULL AUTO_INCREMENT,
  daily_log_id INT,
  user_id INT,
  note VARCHAR(255),
  file VARCHAR(255),
  time DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (daily_log_id) REFERENCES daily_log(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE system_settings (
  id INT NOT NULL AUTO_INCREMENT,
  setting_name VARCHAR(64) UNIQUE,
  setting_value varchar(64),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;