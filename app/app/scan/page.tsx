'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, CameraOff, Type, Scan, CircleCheck as CheckCircle2, Circle as XCircle } from 'lucide-react';
import { parseQRData } from '@/lib/qr-utils';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n-context';
import jsQR from 'jsqr';

export default function ScanPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
        setScanStatus('scanning');

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          requestAnimationFrame(tick);
        };
      }
    } catch (error: any) {
      console.error('Camera error:', error);

      let errorMessage = t('scan.cameraError') || 'Camera access denied';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = t('scan.permissionDenied') || 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = t('scan.noCamera') || 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = t('scan.cameraInUse') || 'Camera is already in use by another application.';
      } else if (error.name === 'NotSupportedError' || error.message === 'Camera not supported') {
        errorMessage = t('scan.notSupported') || 'Camera is not supported. For mobile devices, please use HTTPS connection.';
      }

      toast.error(errorMessage);
      setScanStatus('error');
    }
  };

  const tick = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        setScanStatus('success');
        processQRData(code.data);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setScanning(false);
    setScanStatus('idle');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQRData(manualEntry);
  };

  const processQRData = (dataString: string) => {
    const qrData = parseQRData(dataString);

    if (!qrData) {
      toast.error(t('scan.invalidQR') || 'Invalid QR code data');
      setScanStatus('error');
      setTimeout(() => {
        if (scanning) {
          setScanStatus('scanning');
          animationFrameRef.current = requestAnimationFrame(tick);
        }
      }, 1500);
      return;
    }

    stopCamera();
    setScanStatus('success');

    toast.success(t('scan.success') || 'QR code scanned successfully');

    setTimeout(() => {
      if (qrData.type === 'item') {
        router.push(`/app/items/${qrData.id}`);
      } else if (qrData.type === 'lot') {
        router.push(`/app/items/${qrData.id}`);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const cameraSupported = isHttps || isLocalhost;

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6" dir={dir}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2">
            <Scan className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
            {t('scan.title') || 'QR Scanner'}
          </h1>
          <p className="text-gray-400 text-xs sm:text-base">
            {t('scan.description') || 'Scan QR codes to access items and stock lots'}
          </p>
        </div>

        {!cameraSupported && (
          <Card className="bg-yellow-500/10 border-yellow-500/50 mb-4">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="text-sm text-yellow-200">
                  <p className="font-semibold mb-1">HTTPS Required for Camera</p>
                  <p className="text-xs text-yellow-300/80">
                    Camera access requires a secure HTTPS connection on mobile devices.
                    Please use the Manual Entry option below to enter QR codes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-900 border-gray-800 mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-cyan-400" />
              {t('scan.camera') || 'Camera Scanner'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                {scanning ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                        <div className="absolute inset-0 border-4 border-cyan-400/50 rounded-lg"></div>
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>

                        {scanStatus === 'scanning' && (
                          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-cyan-400 text-sm animate-pulse">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                              {t('scan.scanning') || 'Scanning...'}
                            </div>
                          </div>
                        )}

                        {scanStatus === 'success' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg">
                            <CheckCircle2 className="h-16 w-16 text-green-400" />
                          </div>
                        )}

                        {scanStatus === 'error' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg">
                            <XCircle className="h-16 w-16 text-red-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-center p-8">
                    <Camera className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-gray-600" />
                    <p className="text-sm sm:text-base">{t('scan.cameraInactive') || 'Camera not active'}</p>
                    <p className="text-xs sm:text-sm mt-2 text-gray-500">
                      {t('scan.tapToStart') || 'Tap the button below to start'}
                    </p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-2">
                {!scanning ? (
                  <Button
                    onClick={startCamera}
                    disabled={!cameraSupported}
                    className="flex-1 bg-cyan-400 text-black hover:bg-cyan-500 h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    {t('scan.startCamera') || 'Start Camera'}
                  </Button>
                ) : (
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="flex-1 h-12 text-base border-gray-700"
                  >
                    <CameraOff className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    {t('scan.stopCamera') || 'Stop Camera'}
                  </Button>
                )}
              </div>

              {!cameraSupported && (
                <div className="text-xs text-yellow-400 text-center">
                  Camera disabled - HTTPS required
                </div>
              )}

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-cyan-400 text-2xl">💡</div>
                  <div className="text-xs sm:text-sm text-gray-300 space-y-1">
                    <p>• {t('scan.tip1') || 'Allow camera access when prompted'}</p>
                    <p>• {t('scan.tip2') || 'Hold the QR code steady in the frame'}</p>
                    <p>• {t('scan.tip3') || 'Ensure good lighting for best results'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-gray-400" />
              {t('scan.manual') || 'Manual Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label htmlFor="manual" className="text-sm sm:text-base">
                  {t('scan.enterData') || 'Enter QR Data'}
                </Label>
                <Input
                  id="manual"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  placeholder='{"type":"item","id":"..."}'
                  className="bg-black border-gray-700 font-mono text-xs sm:text-sm h-12 mt-2"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-cyan-400 text-black hover:bg-cyan-500 h-12 text-base"
              >
                <Type className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('scan.process') || 'Process QR Data'}
              </Button>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-2">
                  {t('scan.formatLabel') || 'Format:'}
                </p>
                <code className="block p-3 bg-black rounded text-xs overflow-x-auto">
                  {'{"type":"item","id":"uuid"}'}
                </code>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
