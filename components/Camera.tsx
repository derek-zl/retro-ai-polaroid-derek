
import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Sparkles, Sun, Moon, Palette, Smile, Zap, X } from 'lucide-react';

interface CameraProps {
  onCapture: (dataUrl: string) => void;
  isProcessing: boolean;
}

type FilterType = 'normal' | 'soft' | 'vintage' | 'bw' | 'warm' | 'cool' | 'film';
type TabType = 'filter' | 'beauty' | 'sticker';

const FILTERS: Record<FilterType, { name: string; css: string }> = {
  normal: { name: 'Original', css: 'none' },
  soft: { name: 'Soft', css: 'brightness(1.1) contrast(0.9) saturate(1.1)' },
  vintage: { name: 'Retro', css: 'sepia(0.4) contrast(1.1) brightness(0.9)' },
  bw: { name: 'Mono', css: 'grayscale(1) contrast(1.2)' },
  warm: { name: 'Summer', css: 'sepia(0.2) saturate(1.4) hue-rotate(-10deg)' },
  cool: { name: 'Winter', css: 'brightness(1.05) hue-rotate(10deg) saturate(0.8)' },
  film: { name: '1990s', css: 'contrast(1.2) saturate(1.2) sepia(0.1) brightness(0.9)' },
};

const STICKERS = ["✨", "💖", "🌈", "🕶️", "🐱", "🌸", "🔥", "👑"];

export const Camera: React.FC<CameraProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [flash, setFlash] = useState(false);
  
  // State for Features
  const [activeTab, setActiveTab] = useState<TabType>('filter');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('normal');
  const [beautyLevel, setBeautyLevel] = useState(0); // 0 - 100
  const [activeSticker, setActiveSticker] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError('Permissions needed');
    }
  };

  // Calculate combined CSS filter string
  const getComputedFilter = () => {
    let filterString = FILTERS[currentFilter].css;
    
    if (beautyLevel > 0) {
        // Simulate smoothing/whitening with brightness and contrast manipulation
        // We cannot do real mesh deformation (Slim face/Big eyes) easily without heavy libraries like MediaPipe
        const brightness = 1 + (beautyLevel / 200); // Max 1.5
        const contrast = 1 - (beautyLevel / 400);   // Min 0.75 (Softer look)
        const saturate = 1 - (beautyLevel / 500);   // Reduce redness slightly
        const blur = beautyLevel / 100; // Slight soft focus

        const beautyCSS = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) blur(${blur}px)`;
        
        if (filterString === 'none') {
            filterString = beautyCSS;
        } else {
            filterString += ` ${beautyCSS}`;
        }
    }
    return filterString;
  };

  const takePicture = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 1. Apply Background Filters & Beauty
      context.filter = getComputedFilter();

      // 2. Draw Video (Mirrored)
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Reset transform for stickers
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.filter = 'none';

      // 3. Draw Sticker (Center for simplicity in this version)
      if (activeSticker) {
          context.font = "150px serif";
          context.textAlign = "center";
          context.textBaseline = "middle";
          // Place roughly near where a face might be (center-top)
          context.fillText(activeSticker, canvas.width / 2, canvas.height / 2);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
    }
  };

  return (
    <div className="relative w-[320px] h-[520px] select-none">
        
      {/* Ejection Slot Animation */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-gray-800 rounded-t-lg z-0"></div>

      {/* Main Body - Pastel Pink/Peach for Beauty Edition */}
      <div className="absolute inset-0 bg-rose-100 rounded-[45px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] border-r-8 border-b-8 border-rose-200/50 z-10 flex flex-col items-center overflow-hidden">
        
        {/* Highlight/Gloss */}
        <div className="absolute top-4 left-4 w-12 h-8 bg-white/40 rounded-full blur-md transform -rotate-12 pointer-events-none z-20"></div>

        {/* Top Section: Viewfinder & Flash */}
        <div className="w-full h-20 flex justify-between items-center px-6 pt-4 relative z-20">
            {/* Shutter Button */}
            <button 
                onClick={takePicture}
                disabled={isProcessing || !stream}
                className={`
                   w-12 h-12 rounded-full border-4 border-white shadow-lg relative
                   active:scale-95 transition-transform
                   ${isProcessing ? 'bg-gray-300' : 'bg-rose-400'}
                `}
            >
                <div className="absolute inset-1 rounded-full border border-white/30"></div>
            </button>
            
            <div className="font-black text-rose-300 text-lg italic tracking-tighter">
                instax <span className="text-xs not-italic font-normal bg-rose-400 text-white px-1 rounded">RETRO</span>
            </div>

            {/* Flash */}
            <div className="w-12 h-8 bg-white/80 rounded-full border-2 border-gray-100 relative overflow-hidden flex items-center justify-center">
                 <Zap size={16} className="text-yellow-500" fill="currentColor" />
            </div>
        </div>

        {/* Lens Area (Center) */}
        <div className="relative mt-2 z-10">
             {/* Outer Ring */}
             <div className="w-60 h-60 rounded-full bg-white shadow-xl flex items-center justify-center border-[1px] border-gray-100 relative">
                
                {/* Sticker Overlay Preview (Absolute on top of lens) */}
                {activeSticker && (
                    <div className="absolute z-50 text-6xl pointer-events-none animate-bounce" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                        {activeSticker}
                    </div>
                )}

                {/* Telescoping Ring */}
                <div className="w-52 h-52 rounded-full bg-gray-50 flex items-center justify-center shadow-inner border border-gray-200">
                     {/* Inner Black Ring */}
                     <div className="w-48 h-48 rounded-full bg-black border-4 border-gray-800 overflow-hidden relative">
                        
                        {/* Video Feed */}
                        {error ? (
                            <div className="w-full h-full flex items-center justify-center text-white text-xs p-4 text-center">
                                {error} <button onClick={startCamera}><RefreshCw size={12}/></button>
                            </div>
                        ) : (
                             <video 
                                ref={videoRef}
                                autoPlay 
                                playsInline 
                                muted
                                style={{ filter: getComputedFilter() }}
                                className="w-full h-full object-cover transform scale-x-[-1]" 
                            />
                        )}

                        {/* Lens Glare */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent pointer-events-none rounded-full"></div>
                     </div>
                </div>
             </div>
        </div>

        {/* CONTROL PANEL (Bottom Half) */}
        <div className="flex-1 w-full bg-white/50 backdrop-blur-md mt-4 rounded-t-3xl p-4 flex flex-col gap-3">
            
            {/* Tabs */}
            <div className="flex justify-center gap-4 border-b border-gray-200/50 pb-2">
                <button onClick={() => setActiveTab('beauty')} className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full transition-colors ${activeTab === 'beauty' ? 'bg-rose-400 text-white' : 'text-gray-400'}`}>
                    <Sparkles size={12} /> Beauty
                </button>
                <button onClick={() => setActiveTab('filter')} className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full transition-colors ${activeTab === 'filter' ? 'bg-rose-400 text-white' : 'text-gray-400'}`}>
                    <Palette size={12} /> Filter
                </button>
                <button onClick={() => setActiveTab('sticker')} className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full transition-colors ${activeTab === 'sticker' ? 'bg-rose-400 text-white' : 'text-gray-400'}`}>
                    <Smile size={12} /> Sticker
                </button>
            </div>

            {/* Controls Content */}
            <div className="h-20 overflow-y-auto hide-scrollbar">
                
                {/* Beauty Controls */}
                {activeTab === 'beauty' && (
                    <div className="px-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Natural</span>
                            <span>Glamour</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={beautyLevel} 
                            onChange={(e) => setBeautyLevel(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-400"
                        />
                        <p className="text-center text-[10px] text-gray-400 mt-2">
                            Smoothing • Whitening • Soft Focus
                        </p>
                    </div>
                )}

                {/* Filter List */}
                {activeTab === 'filter' && (
                    <div className="flex gap-3 overflow-x-auto pb-2 px-2 snap-x">
                        {(Object.keys(FILTERS) as FilterType[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => setCurrentFilter(key)}
                                className={`
                                    flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium border snap-start transition-all
                                    ${currentFilter === key 
                                        ? 'bg-rose-100 border-rose-300 text-rose-600 shadow-sm' 
                                        : 'bg-white border-gray-100 text-gray-500'}
                                `}
                            >
                                {FILTERS[key].name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Stickers */}
                {activeTab === 'sticker' && (
                    <div className="flex gap-3 overflow-x-auto pb-2 px-2">
                        <button 
                            onClick={() => setActiveSticker(null)}
                            className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200"
                        >
                            <X size={14} />
                        </button>
                        {STICKERS.map((s) => (
                            <button
                                key={s}
                                onClick={() => setActiveSticker(s)}
                                className={`
                                    flex-shrink-0 w-10 h-10 rounded-full text-xl flex items-center justify-center border transition-transform
                                    ${activeSticker === s ? 'bg-rose-100 border-rose-300 scale-110' : 'bg-white border-gray-100'}
                                `}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

            </div>

        </div>

      </div>

      {/* Main Shutter (Side) */}
      <div className="absolute bottom-32 -right-1 w-4 h-16 bg-rose-300 rounded-r-lg border-r border-rose-400 shadow-sm z-0"></div>

      {/* Flash Effect Overlay */}
      {flash && (
        <div className="fixed inset-0 bg-white z-50 animate-out fade-out duration-500 pointer-events-none mix-blend-overlay"></div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
