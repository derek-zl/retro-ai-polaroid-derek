
import React, { useState, useRef } from 'react';
import { Camera } from './components/Camera';
import { Polaroid } from './components/Polaroid';
import { PolaroidPhoto } from './types';
import { generatePhotoCaption } from './services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PolaroidPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraKey, setCameraKey] = useState(0); // Used to force re-render/restart of camera
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCapture = async (dataUrl: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // 1. Create the photo object immediately for the animation
    const newPhoto: PolaroidPhoto = {
      id: uuidv4(),
      imageUrl: dataUrl,
      timestamp: Date.now(),
      caption: "", // Empty initially
      x: 100, // Start near the camera ejection point
      y: window.innerHeight - 500, // Approximate top of camera
      rotation: (Math.random() - 0.5) * 10, // Random slight tilt
      isDeveloping: true,
    };

    // Add to state to trigger render
    setPhotos((prev) => [...prev, newPhoto]);

    // 2. Animate "Ejection" logic
    setTimeout(() => {
        setPhotos((prev) => prev.map(p => 
            p.id === newPhoto.id 
            ? { ...p, y: p.y - 250, x: p.x + (Math.random() * 80) } 
            : p
        ));
    }, 100);

    // 3. Stop "developing" visual effect after 5 seconds
    setTimeout(() => {
      setPhotos((prev) =>
        prev.map((p) => (p.id === newPhoto.id ? { ...p, isDeveloping: false } : p))
      );
      setIsProcessing(false);
    }, 3000); 

    // 4. Fetch Caption (Now from Presets)
    try {
      const caption = await generatePhotoCaption(dataUrl);
      setPhotos((prev) =>
        prev.map((p) => (p.id === newPhoto.id ? { ...p, caption } : p))
      );
    } catch (e) {
      console.error("Failed to caption", e);
      setPhotos((prev) =>
        prev.map((p) => (p.id === newPhoto.id ? { ...p, caption: "Start of something new" } : p))
      );
    }
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, x, y } : p))
    );
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearWall = () => {
    // Executed immediately without confirmation to ensure responsiveness
    setPhotos([]);
  };

  const handleRestart = () => {
    // Reset everything immediately
    setPhotos([]);
    setCameraKey(prev => prev + 1);
  };

  return (
    <div 
        ref={containerRef} 
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between"
    >
      {/* Header / Instructions */}
      <div className="absolute top-6 right-6 z-40 flex gap-3">
        <button 
          onClick={handleRestart}
          className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-sm border border-gray-200 hover:bg-white hover:scale-110 transition-all text-gray-600 cursor-pointer"
          title="Restart Camera & Clear"
        >
          <RefreshCcw size={20} />
        </button>
        <button 
          onClick={handleClearWall}
          className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-sm border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:scale-110 transition-all text-gray-600 cursor-pointer"
          title="Clear Wall"
        >
          <Trash2 size={20} />
        </button>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200 rotate-2 flex items-center">
            <h1 className="text-xl font-bold text-gray-800 handwritten">My Photo Wall</h1>
        </div>
      </div>

      {/* Photo Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <AnimatePresence>
          {photos.map((photo) => (
            <Polaroid
              key={photo.id}
              photo={photo}
              containerRef={containerRef}
              onDragEnd={handleDragEnd}
              onDelete={handleDeletePhoto}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Camera Layer (Fixed Bottom Left) */}
      <div className="absolute bottom-10 left-10 z-30">
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
        >
            <Camera key={cameraKey} onCapture={handleCapture} isProcessing={isProcessing} />
        </motion.div>
      </div>

      {/* Footer / Credits */}
      <div className="absolute bottom-2 right-4 text-gray-400 text-xs font-mono z-10">
        Retro Cam v1.0
      </div>
    </div>
  );
};

export default App;
