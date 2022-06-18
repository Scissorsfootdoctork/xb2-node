import dotenv from 'dotenv'

dotenv.config()

export const {APP_PORT, MYSQL_PORT, MYSQL_PASSWORD, MYSQL_USER, MYSQL_HOST, MYSQL_DATABASE} = process.env
