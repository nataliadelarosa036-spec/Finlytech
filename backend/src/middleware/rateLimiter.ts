import rateLimit from 'express-rate-limit';

// Límite general para la API
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Demasiadas solicitudes. Intenta en 15 minutos.' },
});

// Límite estricto para auth (evita fuerza bruta)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.' },
    skipSuccessfulRequests: true,
});

// Límite para registro
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Demasiados registros desde esta IP. Intenta en 1 hora.' },
});
