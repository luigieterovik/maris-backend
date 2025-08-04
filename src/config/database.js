import dotenv from 'dotenv'
dotenv.config()

const configDatabase = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  define: {
    freezeTableName: true,
    timestamps: true,
    underscore: true,
    underscoreAll: true,
  },
}

export default configDatabase
