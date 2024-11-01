import dotenv from 'dotenv'
dotenv.config()

const configDatabase = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: process.env.LOCAL_POSTGRES_PASSWORD,
  database: 'maris',
  define: {
    freezeTableName: true,
    timestamps: true,
    underscore: true,
    underscoreAll: true,
  },
}

export default configDatabase
