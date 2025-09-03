import dotenv from 'dotenv'
dotenv.config()

const configDatabase = {
  url: process.env.DB_URL,
  dialect: 'postgres',
  define: {
    freezeTableName: true,
    timestamps: true,
    underscore: true,
    underscoreAll: true,
  },
}

export default configDatabase
