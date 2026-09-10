import { Router, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { sendReportEmail } from '../utils/mailer';
import type { AuthRequest } from '../types';

const router = Router();

/**
 * POST /api/reports/email
 * Body: { summary: string, csvData: string, monthLabel: string }
 * Sends a monthly financial report to the authenticated user's email.
 */
router.post('/email', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        const { summary, csvData, monthLabel } = req.body as {
            summary: string;
            csvData: string;
            monthLabel: string;
        };

        if (!summary && !csvData) {
            res.status(400).json({ success: false, error: 'No hay datos de reporte para enviar.' });
            return;
        }

        await sendReportEmail(
            user.email,
            user.name,
            summary || '',
            csvData || '',
            monthLabel || new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
        );

        res.json({ success: true, message: `Reporte enviado a ${user.email}` });
    } catch (err: any) {
        console.error('Error sending report email:', err?.message || err);
        const msg = err?.message?.includes('Invalid login')
            ? 'Error de autenticación con Gmail. Verifica la App Password en el backend.'
            : err?.message?.includes('No recipients')
                ? 'No hay destinatario de email válido.'
                : err?.message || 'Error al enviar el reporte por correo.';
        res.status(500).json({ success: false, error: msg });
    }
});

export default router;
