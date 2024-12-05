import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shift, NonAccountingDay } from '../../types';
import { MonthlyStats } from '../../types/stats';
import { formatHoursDuration } from '../dateUtils';
import { calculateDuration } from '../time/duration';

export function generateMonthReport(
  currentDate: Date,
  stats: MonthlyStats,
  shifts: Shift[],
  nonAccountingDays: NonAccountingDay[]
): jsPDF {
  // Configuração inicial do PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configuração de fonte para suportar acentos
  doc.setFont('helvetica');
  doc.setLanguage('pt-BR');

  const monthName = format(currentDate, 'MMMM yyyy', { locale: ptBR });

  // Cabeçalho com fundo colorido
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(`Relatório de Horas - ${monthName}`, 15, 13);

  // Reset cor do texto
  doc.setTextColor(0, 0, 0);

  // Resumo do Mês
  doc.setFillColor(243, 244, 246); // gray-100
  doc.rect(15, 30, 180, 8, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo do Mês', 15, 36);

  // Tabela de resumo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const startY = 45;

  // Dias
  doc.setFillColor(249, 250, 251); // gray-50
  doc.rect(15, startY, 180, 25, 'F');
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.line(15, startY, 195, startY); // linha superior
  doc.line(15, startY + 25, 195, startY + 25); // linha inferior
  doc.line(15, startY, 15, startY + 25); // linha esquerda
  doc.line(195, startY, 195, startY + 25); // linha direita

  doc.text('Total de Dias:', 25, startY + 8);
  doc.text(`${stats.days.total}`, 120, startY + 8);
  doc.text('Dias Não Contábeis:', 25, startY + 16);
  doc.text(`${stats.days.nonAccounting}`, 120, startY + 16);
  doc.text('Dias a Trabalhar:', 25, startY + 24);
  doc.text(`${stats.days.effective}`, 120, startY + 24);

  // Horas
  const horasY = startY + 35;
  doc.setFillColor(249, 250, 251); // gray-50
  doc.rect(15, horasY, 180, 25, 'F');
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.line(15, horasY, 195, horasY); // linha superior
  doc.line(15, horasY + 25, 195, horasY + 25); // linha inferior
  doc.line(15, horasY, 15, horasY + 25); // linha esquerda
  doc.line(195, horasY, 195, horasY + 25); // linha direita

  doc.text('Horas Previstas:', 25, horasY + 8);
  doc.text(formatHoursDuration(stats.minutes.expected), 120, horasY + 8);
  doc.text('Horas Trabalhadas:', 25, horasY + 16);
  doc.text(formatHoursDuration(stats.minutes.worked), 120, horasY + 16);

  // Saldo com cor baseada no valor
  doc.text('Saldo:', 25, horasY + 24);
  const saldo = stats.minutes.balance;
  if (saldo >= 0) {
    doc.setTextColor(16, 185, 129); // emerald-500
  } else {
    doc.setTextColor(239, 68, 68); // red-500
  }
  doc.text(formatHoursDuration(saldo), 120, horasY + 24);
  doc.setTextColor(0, 0, 0); // reset para preto

  // Turnos Registrados
  if (shifts.length > 0) {
    const turnosY = horasY + 40;

    // Cabeçalho da seção
    doc.setFillColor(243, 244, 246); // gray-100
    doc.rect(15, turnosY, 180, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Turnos Registrados', 15, turnosY + 6);

    // Cabeçalho da tabela
    doc.setFillColor(249, 250, 251); // gray-50
    doc.rect(15, turnosY + 10, 180, 8, 'F');
    doc.setFontSize(11);
    doc.text('Data', 20, turnosY + 16);
    doc.text('Horário', 70, turnosY + 16);
    doc.text('Duração', 150, turnosY + 16);

    // Linhas da tabela
    let y = turnosY + 20;
    shifts.forEach((shift, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const duration = calculateDuration({
        start: shift.startTime,
        end: shift.endTime
      });

      // Fundo zebrado
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251); // gray-50
        doc.rect(15, y, 180, 8, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.text(format(shift.startTime, "dd/MM/yyyy"), 20, y + 6);
      doc.text(`${format(shift.startTime, 'HH:mm')} - ${format(shift.endTime, 'HH:mm')}`, 70, y + 6);
      doc.text(formatHoursDuration(duration.totalMinutes), 150, y + 6);

      if (shift.description) {
        y += 8;
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128); // gray-500
        doc.text(`Obs: ${shift.description}`, 25, y + 6);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
      }

      y += 8;
    });
  }

  // Dias Não Contábeis
  if (nonAccountingDays.length > 0) {
    doc.addPage();

    // Cabeçalho da seção
    doc.setFillColor(243, 244, 246); // gray-100
    doc.rect(15, 20, 180, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Dias Não Contábeis', 15, 26);

    // Cabeçalho da tabela
    doc.setFillColor(249, 250, 251); // gray-50
    doc.rect(15, 30, 180, 8, 'F');
    doc.setFontSize(11);
    doc.text('Data', 20, 36);
    doc.text('Tipo', 70, 36);
    doc.text('Motivo', 120, 36);

    // Linhas da tabela
    let y = 40;
    nonAccountingDays.forEach((day, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      // Fundo zebrado
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251); // gray-50
        doc.rect(15, y, 180, 8, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.text(format(day.date, "dd/MM/yyyy"), 20, y + 6);
      doc.text(day.type, 70, y + 6);

      if (day.reason) {
        doc.text(day.reason, 120, y + 6);
      }

      y += 8;
    });
  }

  return doc;
}
