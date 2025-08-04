import dotenv from 'dotenv'
dotenv.config()

const configDatabase = {
  dialect: 'postgres',
  url: process.env.DB_URL,
  define: {
    freezeTableName: true,
    timestamps: true,
    underscore: true,
    underscoreAll: true,
  },
}

export default configDatabase
