'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateQRCode } from '@/lib/qr-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

type Item = {
  id: string;
  sku: string;
  name: string;
  unit: string;
};

type StockLot = {
  id: string;
  lot_number: string;
  quantity: number;
  expiry_date: string | null;
};

export default function QRGeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [lots, setLots] = useState<StockLot[]>([]);
  const [itemQR, setItemQR] = useState('');
  const [lotQRs, setLotQRs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    const [itemRes, lotsRes] = await Promise.all([
      supabase.from('items').select('*').eq('id', params.id).maybeSingle(),
      supabase.from('stock_lots').select('*').eq('item_id', params.id),
    ]);

    if (itemRes.data) {
      setItem(itemRes.data);
      const qr = await generateQRCode({
        type: 'item',
        id: itemRes.data.id,
        name: itemRes.data.name,
      });
      setItemQR(qr);
    }

    if (lotsRes.data) {
      setLots(lotsRes.data);
      const qrs: Record<string, string> = {};
      for (const lot of lotsRes.data) {
        qrs[lot.id] = await generateQRCode({
          type: 'lot',
          id: lot.id,
          name: itemRes.data?.name,
          qty: lot.quantity,
          lot: lot.lot_number,
          expiry: lot.expiry_date || undefined,
        });
      }
      setLotQRs(qrs);
    }

    setLoading(false);
  };

  const downloadQR = (qrDataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = filename;
    link.click();
    toast.success('QR code downloaded');
  };

  const printQR = (qrDataUrl: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print QR Code</title></head>
          <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <img src="${qrDataUrl}" style="max-width:100%;max-height:100%;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const printAllLabels = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let html = `
        <html>
          <head>
            <title>Print All QR Labels</title>
            <style>
              @page { size: A4; margin: 10mm; }
              body { font-family: Arial, sans-serif; margin: 0; }
              .label-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; }
              .label { border: 1px solid #ccc; padding: 5mm; text-align: center; page-break-inside: avoid; }
              .label img { width: 60mm; height: 60mm; }
              .label-text { font-size: 10pt; margin-top: 2mm; }
            </style>
          </head>
          <body>
            <div class="label-grid">
      `;

      html += `
        <div class="label">
          <img src="${itemQR}" />
          <div class="label-text"><strong>${item?.name}</strong><br/>SKU: ${item?.sku}</div>
        </div>
      `;

      lots.forEach((lot) => {
        html += `
          <div class="label">
            <img src="${lotQRs[lot.id]}" />
            <div class="label-text">
              <strong>${item?.name}</strong><br/>
              Lot: ${lot.lot_number}<br/>
              Qty: ${lot.quantity} ${item?.unit}
            </div>
          </div>
        `;
      });

      html += `
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Generating QR codes...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Item not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">QR Code Labels</h1>
            <p className="text-gray-400">{item.name}</p>
          </div>
          <Button onClick={printAllLabels} className="bg-cyan-400 text-black hover:bg-cyan-500">
            <Printer className="mr-2 h-4 w-4" />
            Print All Labels
          </Button>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Item QR Code</h2>
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-lg">
              <img src={itemQR} alt="Item QR Code" className="w-64 h-64" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-gray-400 mb-4">SKU: {item.sku}</p>
              <div className="flex gap-2">
                <Button onClick={() => downloadQR(itemQR, `${item.sku}-item.png`)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => printQR(itemQR)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {lots.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Stock Lot QR Codes</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {lots.map((lot) => (
                <div key={lot.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                  <div className="bg-white p-2 rounded">
                    <img src={lotQRs[lot.id]} alt={`Lot ${lot.lot_number}`} className="w-32 h-32" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Lot: {lot.lot_number}</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      Quantity: {lot.quantity} {item.unit}
                    </p>
                    {lot.expiry_date && (
                      <p className="text-xs text-yellow-400 mb-2">
                        Expires: {new Date(lot.expiry_date).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => downloadQR(lotQRs[lot.id], `${item.sku}-lot-${lot.lot_number}.png`)}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => printQR(lotQRs[lot.id])}>
                        <Printer className="mr-1 h-3 w-3" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
