import dotenv from 'dotenv'
dotenv.config()

const configDatabase = {
  url: 'postgresql://postgres:yfTJjUWTBiDkfcbPNVQmOUzXrKPgsekK@ballast.proxy.rlwy.net:38189/railway',
  dialect: 'postgres',
  define: {
    freezeTableName: true,
    timestamps: true,
    underscore: true,
    underscoreAll: true,
  },
}

export default configDatabase
