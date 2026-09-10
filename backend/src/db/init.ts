/**
 * Script de inicialización de la base de datos.
 * Ejecutar UNA VEZ: npx ts-node src/db/init.ts
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function init(): Promise<void> {
    console.log('🗄️  Iniciando base de datos finlytech...\n');

    // Conexión SIN especificar la DB para poder crearla
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true,
    });

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Ejecutar todo el schema
        await conn.query(schema);

        console.log('✅ Base de datos "finlytech" creada correctamente');
        console.log('✅ Todas las tablas creadas');
        console.log('✅ Términos v1.0 insertados');
        console.log('\n🎉 ¡Listo! Ahora puedes correr: npm run dev\n');
    } catch (err: any) {
        console.error('❌ Error inicializando DB:', err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

init();
