import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Use a Pool instead of a single connection for better stability in Docker
const pool = mysql.createPool(dbConfig);

// A simple function to test the connection once
const connectWithRetry = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('MySQL not ready. Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('Successfully connected to MySQL database!');
      connection.release(); // Put the connection back in the pool
    }
  });
};

connectWithRetry();

export default pool.promise(); // Exporting with promise support makes your routes cleaner