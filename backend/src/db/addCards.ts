/**
 * Migration: add cards table to existing finlytech DB
 * Run: npm run db:migrate
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function migrate(): Promise<void> {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'finlytech',
        multipleStatements: true,
    });

    try {
        await conn.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id         CHAR(36)      NOT NULL PRIMARY KEY,
        user_id    CHAR(36)      NOT NULL,
        name       VARCHAR(100)  NOT NULL,
        number     VARCHAR(20)   NOT NULL DEFAULT '',
        card_limit DECIMAL(15,2) NOT NULL DEFAULT 0,
        balance    DECIMAL(15,2) NOT NULL DEFAULT 0,
        due_date   DATE          NOT NULL,
        color      VARCHAR(7)    NOT NULL DEFAULT '#8b5cf6',
        created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB;
    `);
        console.log('✅ Tabla cards creada correctamente.');
    } catch (err: any) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

migrate();
