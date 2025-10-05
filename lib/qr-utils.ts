import QRCode from 'qrcode';

export type QRData = {
  type: 'item' | 'lot';
  id: string;
  name?: string;
  qty?: number;
  expiry?: string;
  lot?: string;
};

export const generateQRCode = async (data: QRData): Promise<string> => {
  const jsonData = JSON.stringify(data);
  const qrDataUrl = await QRCode.toDataURL(jsonData, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
  return qrDataUrl;
};

export const generateQRCodeSVG = async (data: QRData): Promise<string> => {
  const jsonData = JSON.stringify(data);
  const svg = await QRCode.toString(jsonData, {
    type: 'svg',
    width: 300,
    margin: 2,
  });
  return svg;
};

export const parseQRData = (qrString: string): QRData | null => {
  try {
    const data = JSON.parse(qrString);
    if (data.type && data.id) {
      return data as QRData;
    }
    return null;
  } catch {
    return null;
  }
};
