import db from '../config/db.js';

const initDb = async () => {
  const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_uid BIGINT,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      role ENUM('ADMIN', 'TEAM_LEADER', 'MEMBER') DEFAULT 'MEMBER',
      is_active BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(createUserTable);

    try {
      await db.query('ALTER TABLE users ADD COLUMN user_uid BIGINT');
    } catch (err) {
      // ignore if column already exists
    }

    try {
      await db.query('ALTER TABLE users ADD UNIQUE KEY user_uid_unique (user_uid)');
    } catch (err) {
      // ignore if unique key already exists
    }

    console.log("Users table is ready (exists or created).");
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
};

export default initDb;