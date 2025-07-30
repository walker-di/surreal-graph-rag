import { DB_HOST, DB_NAMESPACE, DB_DATABASE, DB_USERNAME, DB_PASSWORD, PORT } from '$env/static/private';

export const SERVER_CONFIG = {
  port: PORT || 3000,
  db: {
    host: DB_HOST || 'localhost',
    namespace: DB_NAMESPACE || 'test',
    database: DB_DATABASE || 'walker-di-admin-dashboard',
    username: DB_USERNAME || 'test',
    password: DB_PASSWORD || 'test',
  },
}