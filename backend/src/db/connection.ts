import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexiones — reutiliza conexiones en lugar de crear una por request
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'finlytech',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00',
    charset: 'utf8mb4',
});

// Verifica la conexión al arrancar
export async function testConnection(): Promise<void> {
    try {
        const conn = await pool.getConnection();
        console.log('✅ MySQL conectado correctamente');
        conn.release();
    } catch (err) {
        console.error('❌ Error conectando a MySQL:', err);
        process.exit(1);
    }
}
