import nodemailer, { Transporter } from 'nodemailer';

// ─── Lazy transporter — created on first use so dotenv is already loaded ──────
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(`Email no configurado. MAIL_USER="${user}" MAIL_APP_PASSWORD="${pass ? '***' : 'undefined'}"`);
  }
  _transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  return _transporter;
}

const FROM = () => `"Finlytech" <${process.env.MAIL_USER}>`;
const APP = () => process.env.APP_URL || 'http://localhost:5173';
const YEAR = new Date().getFullYear();

// ─── Master layout ─────────────────────────────────────────────────────────────
function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Finlytech</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
  style="background:#0d0d0d;min-height:100vh;">
  <tr><td align="center" style="padding:48px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="max-width:540px;width:100%;">
      <!-- wordmark -->
      <tr>
        <td style="padding-bottom:32px;text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0"
            style="display:inline-table;margin:0 auto;">
            <tr>
              <td style="background:#c9a227;border-radius:10px;width:36px;height:36px;
                text-align:center;vertical-align:middle;">
                <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                  font-size:18px;font-weight:800;color:#0d0d0d;line-height:36px;">F</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle;">
                <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                  font-size:20px;font-weight:700;color:#f5f5f5;letter-spacing:-0.4px;">Finlytech</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- card -->
      <tr>
        <td style="background:#161616;border-radius:16px;border:1px solid #262626;overflow:hidden;">
          ${body}
        </td>
      </tr>
      <!-- footer -->
      <tr>
        <td style="padding-top:28px;text-align:center;">
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size:12px;color:#404040;margin:0 0 4px;line-height:1.6;">
            © ${YEAR} Finlytech. Todos los derechos reservados.
          </p>
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size:12px;color:#2e2e2e;margin:0;">
            Este correo fue enviado a tu dirección registrada en Finlytech.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Primary button ────────────────────────────────────────────────────────────
function primaryBtn(href: string, label: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto 0;">
    <tr>
      <td style="background:#c9a227;border-radius:10px;">
        <a href="${href}" target="_blank" style="display:block;padding:14px 36px;
          font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:14px;font-weight:700;color:#0d0d0d;text-decoration:none;
          letter-spacing:0.1px;white-space:nowrap;">${label}</a>
      </td>
    </tr>
  </table>`;
}

// ─── Divider ───────────────────────────────────────────────────────────────────
const rule = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="height:1px;background:#1f1f1f;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`;

// ─────────────────────────────────────────────────────────────────────────────
// 1. BIENVENIDA
// ─────────────────────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const first = name.split(' ')[0];
  const features = [
    ['Dashboard financiero', 'Tu dinero, gastos, ingresos y salud financiera consolidados en una sola vista actualizada en tiempo real.'],
    ['Metas de ahorro', 'Define objetivos con fecha y monto. Finlytech calcula cuánto necesitas ahorrar cada mes para cumplirlos.'],
    ['Control de deudas', 'Simula estrategias de pago para eliminar deudas más rápido y calcula el interés total que te ahorras.'],
    ['Análisis de gastos', 'Categorización automática de tus movimientos con alertas cuando te acercas al límite de tu presupuesto.'],
    ['Portafolio de inversiones', 'Registra tus activos y visualiza tu rentabilidad, dividendos y evolución patrimonial.'],
    ['Copiloto financiero', 'Análisis inteligente de tus hábitos con sugerencias concretas adaptadas a tu situación.'],
  ];
  const featureRows = features.map(([title, desc]) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #1f1f1f;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:13px;font-weight:700;color:#e8e8e8;margin:0 0 4px;">${title}</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:13px;color:#5a5a5a;margin:0;line-height:1.55;">${desc}</p>
      </td>
    </tr>`).join('');

  const body = `
    <tr><td style="height:3px;background:linear-gradient(90deg,#c9a227,#e8c547);font-size:0;"></td></tr>
    <tr>
      <td style="padding:40px 44px 32px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:22px;font-weight:700;color:#f0f0f0;margin:0 0 16px;line-height:1.3;">
          Bienvenido, ${first}.</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:15px;color:#606060;margin:0;line-height:1.7;">
          Tu cuenta en Finlytech está activa. A partir de ahora tienes un sistema completo
          para entender, planificar y mejorar tus finanzas personales — todo en un solo lugar.
        </p>
      </td>
    </tr>
    ${rule}
    <tr>
      <td style="padding:32px 44px 8px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:11px;font-weight:700;color:#c9a227;letter-spacing:1.5px;
          text-transform:uppercase;margin:0 0 4px;">Lo que incluye tu cuenta</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
          ${featureRows}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 44px 44px;text-align:center;">
        ${primaryBtn(APP(), 'Abrir mi dashboard')}
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:12px;color:#383838;margin:20px 0 0;">
          Sin tarjeta de crédito &nbsp;·&nbsp; Sin compromisos
        </p>
      </td>
    </tr>`;

  await getTransporter().sendMail({ from: FROM(), to: email, subject: `Bienvenido a Finlytech, ${first}`, html: layout(body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. VERIFICACIÓN DE EMAIL
// ─────────────────────────────────────────────────────────────────────────────
export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const first = name.split(' ')[0];
  const link = `${APP()}/verify-email?token=${token}`;
  const body = `
    <tr><td style="height:3px;background:linear-gradient(90deg,#c9a227,#e8c547);font-size:0;"></td></tr>
    <tr>
      <td style="padding:44px 44px 32px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:22px;font-weight:700;color:#f0f0f0;margin:0 0 16px;">
          Confirma tu dirección de correo</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:15px;color:#606060;margin:0;line-height:1.7;">
          Hola ${first}, necesitamos verificar que esta dirección te pertenece
          antes de activar todas las funciones de tu cuenta.
          El enlace es válido durante <strong style="color:#909090;">24 horas</strong>.
        </p>
        <div style="text-align:center;">${primaryBtn(link, 'Confirmar correo electrónico')}</div>
      </td>
    </tr>
    ${rule}
    <tr>
      <td style="padding:24px 44px 36px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:11px;font-weight:700;color:#383838;letter-spacing:1px;
          text-transform:uppercase;margin:0 0 8px;">Enlace alternativo</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:12px;color:#3a3a3a;margin:0;word-break:break-all;line-height:1.6;">${link}</p>
      </td>
    </tr>`;
  await getTransporter().sendMail({ from: FROM(), to: email, subject: 'Confirma tu correo — Finlytech', html: layout(body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. RECUPERAR CONTRASEÑA
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
  const first = name.split(' ')[0];
  const link = `${APP()}/reset-password?token=${token}`;
  const body = `
    <tr><td style="height:3px;background:#262626;font-size:0;"></td></tr>
    <tr>
      <td style="padding:44px 44px 32px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:22px;font-weight:700;color:#f0f0f0;margin:0 0 16px;">
          Solicitud de nueva contraseña</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:15px;color:#606060;margin:0;line-height:1.7;">
          Hola ${first}, recibimos una solicitud para restablecer la contraseña
          asociada a esta cuenta. Este enlace expira en
          <strong style="color:#909090;">1 hora</strong>.
        </p>
        <div style="text-align:center;">${primaryBtn(link, 'Restablecer contraseña')}</div>
      </td>
    </tr>
    ${rule}
    <tr>
      <td style="padding:24px 44px 36px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:12px;color:#3a3a3a;margin:0;word-break:break-all;line-height:1.6;">${link}</p>
      </td>
    </tr>`;
  await getTransporter().sendMail({ from: FROM(), to: email, subject: 'Restablece tu contraseña — Finlytech', html: layout(body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CONTRASEÑA CAMBIADA
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPasswordChangedEmail(email: string, name: string): Promise<void> {
  const first = name.split(' ')[0];
  const when = new Date().toLocaleString('es-CO', {
    timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short',
  });
  const body = `
    <tr><td style="height:3px;background:#262626;font-size:0;"></td></tr>
    <tr>
      <td style="padding:44px 44px 32px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:22px;font-weight:700;color:#f0f0f0;margin:0 0 16px;">
          Tu contraseña fue actualizada</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:15px;color:#606060;margin:0;line-height:1.7;">
          Hola ${first}, este es un aviso de seguridad: la contraseña de tu cuenta fue modificada.
        </p>
      </td>
    </tr>
    ${rule}
    <tr>
      <td style="padding:28px 44px 40px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:13px;color:#686868;margin:0;">
          Fecha y hora: <span style="color:#909090;font-weight:600;">${when} (COT)</span>
        </p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:13px;color:#484848;margin:16px 0 0;line-height:1.65;
          border-left:3px solid #2e1a1a;padding-left:14px;">
          Si no realizaste este cambio, contáctanos a
          <a href="mailto:soporte@finlytech.app"
            style="color:#c9a227;text-decoration:none;">soporte@finlytech.app</a>
        </p>
      </td>
    </tr>`;
  await getTransporter().sendMail({ from: FROM(), to: email, subject: 'Aviso de seguridad — contraseña actualizada', html: layout(body) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. REPORTE FINANCIERO MENSUAL
// ─────────────────────────────────────────────────────────────────────────────
export async function sendReportEmail(
  email: string,
  name: string,
  summary: string,
  csvData: string,
  monthLabel: string,
): Promise<void> {
  const first = name.split(' ')[0];

  const summaryLines = summary
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('='))
    .map((line) => {
      const isHeader = !line.startsWith(' ') && !line.includes(':') && line.length < 40;
      if (isHeader) {
        return `<tr><td colspan="2" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:11px;font-weight:700;color:#c9a227;letter-spacing:1.5px;
          text-transform:uppercase;padding:20px 0 8px;">${line.trim()}</td></tr>`;
      }
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) return '';
      const label = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      if (!value) return '';
      return `<tr>
        <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:13px;color:#606060;padding:4px 0;width:60%;">${label}</td>
        <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:13px;color:#e0e0e0;font-weight:600;padding:4px 0;text-align:right;">${value}</td>
      </tr>`;
    })
    .join('');

  const attachments: nodemailer.SendMailOptions['attachments'] = [];
  if (csvData) {
    attachments.push({
      filename: `finlytech-movimientos-${monthLabel.replace(/\s/g, '-')}.csv`,
      content: Buffer.from(csvData, 'utf-8'),
      contentType: 'text/csv',
    });
  }

  const body = `
    <tr><td style="height:3px;background:linear-gradient(90deg,#c9a227,#e8c547);font-size:0;"></td></tr>
    <tr>
      <td style="padding:36px 44px 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
          <tr>
            <td style="background:#c9a227;border-radius:8px;width:30px;height:30px;
              text-align:center;vertical-align:middle;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                font-size:16px;font-weight:800;color:#0d0d0d;line-height:30px;">F</span>
            </td>
            <td style="padding-left:10px;vertical-align:middle;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                font-size:18px;font-weight:700;color:#f5f5f5;letter-spacing:-0.3px;">Finlytech</span>
            </td>
          </tr>
        </table>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:11px;font-style:italic;color:#484848;margin:0 0 24px;">Tu dinero, tu futuro.</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:22px;font-weight:700;color:#f0f0f0;margin:0 0 6px;line-height:1.3;">
          Reporte Financiero</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:13px;color:#505050;margin:0;">
          ${first}, aquí está tu resumen de
          <strong style="color:#909090;">${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</strong>.
        </p>
      </td>
    </tr>
    ${rule}
    <tr>
      <td style="padding:28px 44px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:11px;font-weight:700;color:#c9a227;letter-spacing:1.5px;
          text-transform:uppercase;margin:0 0 12px;">Resumen del mes</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${summaryLines}
        </table>
      </td>
    </tr>
    ${rule}
    ${csvData ? `
    <tr>
      <td style="padding:24px 44px;">
        <table role="presentation" cellpadding="0" cellspacing="0"
          style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;width:100%;">
          <tr>
            <td style="padding:18px 22px;">
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                font-size:11px;font-weight:700;color:#484848;
                letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">Archivo adjunto</p>
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                font-size:13px;color:#686868;margin:0;">
                📎 <span style="color:#909090;">finlytech-movimientos-${monthLabel.replace(/\s/g, '-')}.csv</span>
                — movimientos del mes listos para Excel o Google Sheets.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ''}
    <tr>
      <td style="padding:8px 44px 44px;text-align:center;">
        ${primaryBtn(APP(), 'Ver mi dashboard')}
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:11px;color:#2e2e2e;margin:18px 0 0;">
          Enviado automáticamente desde tu cuenta Finlytech
        </p>
      </td>
    </tr>`;

  await getTransporter().sendMail({
    from: FROM(),
    to: email,
    subject: `Tu reporte financiero de ${monthLabel} — Finlytech`,
    html: layout(body),
    attachments,
  });
}
