const Sequelize = require('sequelize');

// Konfigurasi koneksi database dari variabel lingkungan
const config = {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: console.log, // Aktifkan pencatatan SQL untuk debugging (non-production)
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+07:00', // Sesuaikan dengan zona waktu Anda
};

// Buat instance Sequelize
const db = new Sequelize(config);

// Uji koneksi ke database
db
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = db;
