'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, CameraOff, Type, Scan, Upload, Image as ImageIcon, CircleCheck as CheckCircle2, Circle as XCircle } from 'lucide-react';
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        setUploadedImage(null);

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          requestAnimationFrame(tick);
        };
      }
    } catch (error: any) {
      console.error('Camera error:', error);

      let errorMessage = 'Camera access failed';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access or use the Upload Image option.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found. Please use Upload Image or Manual Entry.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera is in use by another app. Please close other apps or use Upload Image.';
      } else if (error.name === 'NotSupportedError' || error.message === 'Camera not supported') {
        errorMessage = 'Camera not supported on this device. Please use Upload Image or Manual Entry.';
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    stopCamera();
    setScanStatus('scanning');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        setUploadedImage(event.target?.result as string);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          setScanStatus('success');
          processQRData(code.data);
        } else {
          setScanStatus('error');
          toast.error('No QR code found in image. Please try another image or use Manual Entry.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQRData(manualEntry);
  };

  const processQRData = (dataString: string) => {
    const qrData = parseQRData(dataString);

    if (!qrData) {
      toast.error('Invalid QR code data');
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

    toast.success('QR code scanned successfully');

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

        <Card className="bg-gray-900 border-gray-800 mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Camera className="h-5 w-5 text-cyan-400" />
              Scanner Options
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
                      <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                        <div className="absolute inset-0 border-4 border-cyan-400/50 rounded-lg"></div>
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>

                        {scanStatus === 'scanning' && (
                          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-cyan-400 text-sm animate-pulse">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                              Scanning...
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
                ) : uploadedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={uploadedImage}
                      alt="Uploaded QR"
                      className="w-full h-full object-contain"
                    />
                    {scanStatus === 'success' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                        <CheckCircle2 className="h-16 w-16 text-green-400" />
                      </div>
                    )}
                    {scanStatus === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                        <XCircle className="h-16 w-16 text-red-400" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center p-4 sm:p-8">
                    <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-600" />
                    <p className="text-sm sm:text-base font-medium mb-2">No scanner active</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Start camera, upload image, or use manual entry
                    </p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {!scanning ? (
                  <>
                    <Button
                      onClick={startCamera}
                      className="bg-cyan-400 text-black hover:bg-cyan-500 h-11 sm:h-12 text-sm sm:text-base"
                    >
                      <Camera className={`h-4 w-4 sm:h-5 sm:w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      Start Camera
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 h-11 sm:h-12 text-sm sm:text-base"
                    >
                      <Upload className={`h-4 w-4 sm:h-5 sm:w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      Upload Image
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="col-span-full h-11 sm:h-12 text-sm sm:text-base border-gray-700"
                  >
                    <CameraOff className={`h-4 w-4 sm:h-5 sm:w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    Stop Camera
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="text-xl sm:text-2xl">💡</div>
                  <div className="text-xs sm:text-sm text-gray-300 space-y-1">
                    <p className="font-medium text-cyan-400 mb-1">Tips:</p>
                    <p>• Use <strong>Upload Image</strong> if camera doesn't work</p>
                    <p>• You can take a photo with your phone's camera app first</p>
                    <p>• Ensure QR code is clear and well-lit</p>
                    <p>• Use Manual Entry as a fallback option</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Type className="h-5 w-5 text-gray-400" />
              Manual Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label htmlFor="manual" className="text-xs sm:text-sm">
                  Enter QR Data
                </Label>
                <Input
                  id="manual"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  placeholder='{"type":"item","id":"..."}'
                  className="bg-black border-gray-700 font-mono text-xs sm:text-sm h-11 sm:h-12 mt-2"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-cyan-400 text-black hover:bg-cyan-500 h-11 sm:h-12 text-sm sm:text-base"
              >
                <Type className={`h-4 w-4 sm:h-5 sm:w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                Process QR Data
              </Button>

              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-2">
                  Format:
                </p>
                <code className="block p-2 sm:p-3 bg-black rounded text-xs overflow-x-auto">
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
