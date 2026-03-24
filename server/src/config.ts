export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
