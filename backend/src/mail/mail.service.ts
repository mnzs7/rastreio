import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface StatusUpdateEmail {
  to: string;
  destinatarioNome: string;
  codigoRastreio: string;
  novoStatus: string;
  localizacao: string;
  observacao?: string;
}

const STATUS_LABELS: Record<string, string> = {
  AGUARDANDO_COLETA: 'Aguardando Coleta',
  COLETADO: 'Coletado',
  EM_TRANSITO: 'Em Trânsito',
  EM_SEPARACAO: 'Em Separação',
  SAIU_PARA_ENTREGA: 'Saiu para Entrega',
  ENTREGUE: 'Entregue',
  TENTATIVA_ENTREGA: 'Tentativa de Entrega',
  DEVOLVIDO: 'Devolvido',
  EXTRAVIADO: 'Extraviado',
  CANCELADO: 'Cancelado',
};

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    }
  }

  async sendStatusUpdate(data: StatusUpdateEmail): Promise<void> {
    if (!this.transporter) {
      console.log(`[Mail] ${data.to} | ${data.codigoRastreio} | ${data.novoStatus} em ${data.localizacao}`);
      return;
    }

    const label = STATUS_LABELS[data.novoStatus] || data.novoStatus;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#2563eb;color:white;padding:20px;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;font-size:22px;">📦 Atualização de Encomenda</h1>
      </div>
      <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
        <p>Olá, <strong>${data.destinatarioNome}</strong>!</p>
        <p>Sua encomenda foi atualizada:</p>
        <div style="background:white;padding:16px;border-radius:8px;border-left:4px solid #2563eb;margin:16px 0;">
          <p style="margin:4px 0"><strong>Código:</strong> ${data.codigoRastreio}</p>
          <p style="margin:4px 0"><strong>Status:</strong> ${label}</p>
          <p style="margin:4px 0"><strong>Localização:</strong> ${data.localizacao}</p>
          ${data.observacao ? `<p style="margin:4px 0"><strong>Observação:</strong> ${data.observacao}</p>` : ''}
        </div>
        <a href="${frontendUrl}/track/${data.codigoRastreio}"
           style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
          Rastrear Encomenda
        </a>
        <p style="color:#6b7280;font-size:12px;margin-top:20px;">RastreioApp — Sistema de Rastreamento</p>
      </div>
    </body></html>`;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@rastreio.com',
      to: data.to,
      subject: `Encomenda ${data.codigoRastreio} atualizada — ${label}`,
      html,
    });
  }
}
