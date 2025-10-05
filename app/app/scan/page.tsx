'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, CameraOff, Type } from 'lucide-react';
import { parseQRData } from '@/lib/qr-utils';
import { toast } from 'sonner';

export default function ScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);

        intervalRef.current = setInterval(() => {
          captureAndDecode();
        }, 500);
      }
    } catch (error) {
      toast.error('Camera access denied. Please use manual entry.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setScanning(false);
  };

  const captureAndDecode = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQRData(manualEntry);
  };

  const processQRData = (dataString: string) => {
    const qrData = parseQRData(dataString);

    if (!qrData) {
      toast.error('Invalid QR code data');
      return;
    }

    stopCamera();

    if (qrData.type === 'item') {
      router.push(`/app/items/${qrData.id}`);
    } else if (qrData.type === 'lot') {
      router.push(`/app/items/${qrData.id}`);
    }

    toast.success('QR code scanned successfully');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">QR Code Scanner</h1>
        <p className="text-gray-400">Scan QR codes to access items and stock lots</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Camera Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                {scanning ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera not active</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-2">
                {!scanning ? (
                  <Button onClick={startCamera} className="flex-1 bg-cyan-400 text-black hover:bg-cyan-500">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="outline" className="flex-1">
                    <CameraOff className="mr-2 h-4 w-4" />
                    Stop Camera
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-400">
                <p>Allow camera access to scan QR codes automatically.</p>
                <p className="mt-1">Position the QR code in front of your camera.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label htmlFor="manual">Enter QR Data</Label>
                <Input
                  id="manual"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  placeholder='{"type":"item","id":"..."}'
                  className="bg-black border-gray-700 font-mono text-sm"
                />
              </div>

              <Button type="submit" className="w-full bg-cyan-400 text-black hover:bg-cyan-500">
                <Type className="mr-2 h-4 w-4" />
                Process QR Data
              </Button>

              <div className="text-sm text-gray-400">
                <p>Manually enter QR code data if camera scanning is not available.</p>
                <p className="mt-2">Format:</p>
                <code className="block mt-1 p-2 bg-black rounded text-xs">
                  {'{"type":"item","id":"uuid"}'}
                </code>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-800 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions After Scanning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Receive Stock</h4>
              <p className="text-sm text-gray-400">
                Scan an item QR, then add quantity and location to receive new stock.
              </p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Pick Stock</h4>
              <p className="text-sm text-gray-400">
                Scan a lot QR to quickly pick stock for orders or consumption.
              </p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Transfer Stock</h4>
              <p className="text-sm text-gray-400">
                Scan a lot QR and select a new location to transfer stock.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
