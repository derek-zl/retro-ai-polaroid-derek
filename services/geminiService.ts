
// No external API dependencies needed anymore
const PRESET_CAPTIONS = [
  "Good vibes only ✌️",
  "Living the dream",
  "Sunday kind of love",
  "Chasing sunsets 🌅",
  "Coffee & Contemplation",
  "Messy hair, don't care",
  "Creating memories",
  "Just be you",
  "Escape the ordinary",
  "Radiate positivity ✨",
  "Sweater weather",
  "Sunkissed",
  "Start somewhere",
  "Enjoy the little things",
  "Life is beautiful",
  "Keep it simple",
  "Stay curious",
  "Better together",
  "Wild heart",
  "Peace of mind",
  "Forever young",
  "Magic moments",
  "Pure joy",
  "Time flies ⏳",
  "Focus on good",
  "Hello sunshine",
  "Adventure awaits",
  "Perfectly imperfect",
  "Snapshot 📸",
  "So aesthetic"
];

export const generatePhotoCaption = async (base64Image: string): Promise<string> => {
  // Simulate a "developing" delay to match the Polaroid animation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Randomly select a caption from the preset list
  const randomIndex = Math.floor(Math.random() * PRESET_CAPTIONS.length);
  return PRESET_CAPTIONS[randomIndex];
};
