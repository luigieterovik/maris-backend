import { S3Client } from '@aws-sdk/client-s3'

import dotenv from 'dotenv'
dotenv.config()

export const s3client = new S3Client({
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_KEY,
  },
  region: process.env.BUCKET_REGION,
})

export default s3client