import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const paymentLink = 'https://nubank.com.br/cobrar/xbbuq/6756ed14-3da5-47c4-bc13-3ae656ca4aa2';

// Configurações do QR Code
const options = {
  errorCorrectionLevel: 'H',
  type: 'png',
  quality: 0.92,
  margin: 1,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
};

// Caminho para salvar o QR code
const qrCodePath = join(__dirname, '..', 'public', 'qr-code-payment.png');

// Gerar o QR code
QRCode.toFile(qrCodePath, paymentLink, options, function (err) {
  if (err) {
    console.error('Erro ao gerar QR code:', err);
    return;
  }
  console.log('QR code gerado com sucesso:', qrCodePath);
});
