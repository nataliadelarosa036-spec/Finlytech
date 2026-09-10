import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, Budget, Goal, Debt } from '@/types';
import { formatCurrency } from '@/utils/format';
import {
    getMonthlyIncome,
    getMonthlyExpenses,
    getMonthlySavings,
    getSavingsRate,
    getSpendingByCategory,
} from '@/utils/calculations';

// ─── Brand colors ─────────────────────────────────────────────────────────────
const GOLD = [201, 162, 39] as [number, number, number];
const DARK = [13, 13, 13] as [number, number, number];
const CARD = [22, 22, 22] as [number, number, number];
const BORDER = [38, 38, 38] as [number, number, number];
const WHITE = [245, 245, 245] as [number, number, number];
const MUTED = [120, 120, 120] as [number, number, number];
const MUTED2 = [80, 80, 80] as [number, number, number];

// ─── Image helpers ────────────────────────────────────────────────────────────
async function loadImageAsBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function getImageDimensions(base64: string): Promise<{ w: number; h: number }> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.src = base64;
    });
}

// ─── Main PDF builder ─────────────────────────────────────────────────────────
export async function generateReportPDF(
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    debts: Debt[],
    userName = 'Usuario',
): Promise<jsPDF> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const PW = doc.internal.pageSize.getWidth();   // 210
    const PH = doc.internal.pageSize.getHeight();  // 297

    // Load logo & slogan
    let logoB64: string | null = null;
    let sloganB64: string | null = null;
    try { logoB64 = await loadImageAsBase64('/src/logo/logofynlytech.png'); } catch (_) { /* ok */ }
    try { sloganB64 = await loadImageAsBase64('/src/logo/eslogan.png'); } catch (_) { /* ok */ }

    // ── Page background ──────────────────────────────────────────────────────────
    doc.setFillColor(...DARK);
    doc.rect(0, 0, PW, PH, 'F');

    // ── Gold top bar ─────────────────────────────────────────────────────────────
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, PW, 2.5, 'F');

    // ── Logo ─────────────────────────────────────────────────────────────────────
    const MARGIN = 14;
    let curY = 12;

    if (logoB64) {
        const { w, h } = await getImageDimensions(logoB64);
        const logoH = 14;
        const logoW = (w / h) * logoH;
        doc.addImage(logoB64, 'PNG', MARGIN, curY, logoW, logoH);
    } else {
        // Fallback: gold square + wordmark
        doc.setFillColor(...GOLD);
        doc.roundedRect(MARGIN, curY, 10, 10, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...DARK);
        doc.text('F', MARGIN + 3.5, curY + 7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...WHITE);
        doc.text('Finlytech', MARGIN + 13, curY + 7.5);
    }

    // ── Slogan ───────────────────────────────────────────────────────────────────
    if (sloganB64) {
        const { w, h } = await getImageDimensions(sloganB64);
        const sloganH = 7;
        const sloganW = (w / h) * sloganH;
        doc.addImage(sloganB64, 'PNG', MARGIN, curY + 16, sloganW, sloganH);
        curY += 30;
    } else {
        curY += 18;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED2);
        doc.text('Tu dinero, tu futuro.', MARGIN, curY);
        curY += 8;
    }

    // ── Report title & date ──────────────────────────────────────────────────────
    const monthLabel = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    const genDate = new Date().toLocaleDateString('es-CO', { dateStyle: 'long' });

    doc.setFillColor(...CARD);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(MARGIN, curY, PW - MARGIN * 2, 22, 4, 4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...WHITE);
    doc.text('Estado Financiero', MARGIN + 6, curY + 9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(
        `${userName}  ·  ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}  ·  Generado el ${genDate}`,
        MARGIN + 6, curY + 16,
    );
    curY += 28;

    // ─── HELPERS ─────────────────────────────────────────────────────────────────
    const addSection = (title: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...GOLD);
        doc.text(title.toUpperCase(), MARGIN, curY);
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.4);
        doc.line(MARGIN, curY + 1.5, PW - MARGIN, curY + 1.5);
        curY += 7;
    };

    const addKV = (label: string, value: string, valueColor: [number, number, number] = WHITE) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        doc.text(label, MARGIN + 4, curY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...valueColor);
        doc.text(value, PW - MARGIN - 4, curY, { align: 'right' });
        curY += 6.5;
    };

    const ensureSpace = (needed: number) => {
        if (curY + needed > PH - 18) {
            doc.addPage();
            doc.setFillColor(...DARK);
            doc.rect(0, 0, PW, PH, 'F');
            doc.setFillColor(...GOLD);
            doc.rect(0, 0, PW, 1.5, 'F');
            curY = 14;
        }
    };

    // ─── 1. RESUMEN GENERAL ──────────────────────────────────────────────────────
    const income = getMonthlyIncome(transactions);
    const expenses = getMonthlyExpenses(transactions);
    const savings = getMonthlySavings(transactions);
    const rate = getSavingsRate(income, expenses);
    const totalDebt = debts.reduce((s, d) => s + d.balance, 0);

    addSection('Resumen General');
    addKV('Ingresos del mes', formatCurrency(income), [74, 222, 128]);
    addKV('Gastos del mes', formatCurrency(expenses), [248, 113, 113]);
    addKV('Ahorro neto', formatCurrency(savings), savings >= 0 ? [74, 222, 128] : [248, 113, 113]);
    addKV('Tasa de ahorro', `${rate.toFixed(1)}%`, rate >= 20 ? [74, 222, 128] : rate >= 10 ? [251, 191, 36] : [248, 113, 113]);
    addKV('Deuda total', formatCurrency(totalDebt), totalDebt === 0 ? [74, 222, 128] : [248, 113, 113]);
    curY += 4;

    // ─── 2. GASTOS POR CATEGORÍA ─────────────────────────────────────────────────
    const byCategory = getSpendingByCategory(transactions);
    if (byCategory.length > 0) {
        ensureSpace(30);
        addSection('Gastos por Categoría');
        autoTable(doc, {
            startY: curY,
            head: [['Categoría', 'Monto']],
            body: byCategory.map((c) => [
                `${c.category.icon} ${c.category.name}`,
                formatCurrency(c.amount),
            ]),
            theme: 'plain',
            styles: {
                font: 'helvetica',
                fontSize: 9,
                textColor: MUTED as [number, number, number],
                fillColor: DARK as [number, number, number],
                cellPadding: 2.5,
            },
            headStyles: {
                textColor: GOLD,
                fontStyle: 'bold',
                fillColor: DARK,
                lineWidth: 0,
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { halign: 'right', textColor: WHITE },
            },
            alternateRowStyles: { fillColor: CARD as [number, number, number] },
            margin: { left: MARGIN, right: MARGIN },
        });
        curY = (doc as any).lastAutoTable.finalY + 8;
    }

    // ─── 3. PRESUPUESTOS ─────────────────────────────────────────────────────────
    if (budgets.length > 0) {
        ensureSpace(30);
        addSection('Presupuestos');
        autoTable(doc, {
            startY: curY,
            head: [['Categoría', 'Gastado', 'Límite', '%']],
            body: budgets.map((b) => {
                const pct = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
                return [
                    b.category.name,
                    formatCurrency(b.spent),
                    formatCurrency(b.limit),
                    `${pct.toFixed(0)}%`,
                ];
            }),
            theme: 'plain',
            styles: {
                font: 'helvetica',
                fontSize: 9,
                textColor: MUTED,
                fillColor: DARK,
                cellPadding: 2.5,
            },
            headStyles: { textColor: GOLD, fontStyle: 'bold', fillColor: DARK, lineWidth: 0 },
            columnStyles: {
                1: { halign: 'right', textColor: WHITE },
                2: { halign: 'right', textColor: MUTED },
                3: { halign: 'right', textColor: WHITE },
            },
            alternateRowStyles: { fillColor: CARD },
            margin: { left: MARGIN, right: MARGIN },
        });
        curY = (doc as any).lastAutoTable.finalY + 8;
    }

    // ─── 4. METAS ────────────────────────────────────────────────────────────────
    if (goals.length > 0) {
        ensureSpace(30);
        addSection('Metas de Ahorro');
        autoTable(doc, {
            startY: curY,
            head: [['Meta', 'Actual', 'Objetivo', 'Progreso']],
            body: goals.map((g) => {
                const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
                return [
                    `${g.emoji} ${g.name}`,
                    formatCurrency(g.current),
                    formatCurrency(g.target),
                    `${pct.toFixed(0)}%`,
                ];
            }),
            theme: 'plain',
            styles: {
                font: 'helvetica',
                fontSize: 9,
                textColor: MUTED,
                fillColor: DARK,
                cellPadding: 2.5,
            },
            headStyles: { textColor: GOLD, fontStyle: 'bold', fillColor: DARK, lineWidth: 0 },
            columnStyles: {
                1: { halign: 'right', textColor: WHITE },
                2: { halign: 'right', textColor: MUTED },
                3: { halign: 'right', textColor: [74, 222, 128] as [number, number, number] },
            },
            alternateRowStyles: { fillColor: CARD },
            margin: { left: MARGIN, right: MARGIN },
        });
        curY = (doc as any).lastAutoTable.finalY + 8;
    }

    // ─── 5. MOVIMIENTOS ──────────────────────────────────────────────────────────
    if (transactions.length > 0) {
        ensureSpace(30);
        addSection('Movimientos del Mes');
        const sorted = [...transactions].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ).slice(0, 50); // max 50 rows to avoid huge PDFs
        autoTable(doc, {
            startY: curY,
            head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
            body: sorted.map((t) => [
                new Date(t.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
                t.description || '—',
                `${t.category?.icon ?? ''} ${t.category?.name ?? 'General'}`,
                formatCurrency(t.amount),
            ]),
            theme: 'plain',
            styles: {
                font: 'helvetica',
                fontSize: 8,
                textColor: MUTED,
                fillColor: DARK,
                cellPadding: 2,
                overflow: 'ellipsize',
            },
            headStyles: { textColor: GOLD, fontStyle: 'bold', fillColor: DARK, lineWidth: 0 },
            columnStyles: {
                0: { cellWidth: 18 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 38 },
                3: { halign: 'right', textColor: WHITE, cellWidth: 28 },
            },
            alternateRowStyles: { fillColor: CARD },
            margin: { left: MARGIN, right: MARGIN },
        });
        curY = (doc as any).lastAutoTable.finalY + 8;
    }

    // ─── Footer on every page ────────────────────────────────────────────────────
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(...CARD);
        doc.rect(0, PH - 10, PW, 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...MUTED2);
        doc.text('© Finlytech — Todos los derechos reservados', MARGIN, PH - 3.5);
        doc.text(`Página ${i} de ${totalPages}`, PW - MARGIN, PH - 3.5, { align: 'right' });
    }

    return doc;
}
