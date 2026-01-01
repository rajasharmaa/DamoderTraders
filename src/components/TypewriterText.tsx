// components/TypewriterText.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  delay?: number;
  className?: string;
  cursorColor?: string;
  cursorBlinkSpeed?: number;
}

const TypewriterText = ({ 
  texts, 
  speed = 50, 
  delay = 1000,
  className = '',
  cursorColor = 'text-blue-600',
  cursorBlinkSpeed = 0.7
}: TypewriterTextProps) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timeout = setTimeout(() => {
      const currentWord = texts[currentIndex];
      
      if (!isDeleting) {
        // Typing forward
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
        } else {
          // Pause at the end before deleting
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, delay);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentWord.substring(0, currentText.length - 1));
        } else {
          // Move to next word
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % texts.length);
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), 500);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isDeleting, isPaused, texts, speed, delay]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative">
        {currentText}
        <AnimatePresence mode="wait">
          <motion.span
            key="cursor"
            className={`inline-block w-0.5 h-6 ml-1 ${cursorColor} align-middle`}
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{
              duration: cursorBlinkSpeed,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </AnimatePresence>
        
        {/* Optional gradient overlay */}
        <span className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </span>
      
      {/* Optional subtle background for better readability */}
      <span className="absolute -inset-4 bg-gradient-to-r from-blue-50/20 to-cyan-50/20 rounded-lg -z-10 blur-sm" />
    </div>
  );
};

// Advanced Typewriter with multiple lines
export const MultiLineTypewriter = ({ 
  lines,
  lineDelay = 500,
  ...props 
}: { 
  lines: string[][];
  lineDelay?: number;
} & Omit<TypewriterTextProps, 'texts'>) => {
  const [activeLine, setActiveLine] = useState(0);

  return (
    <div className="space-y-2">
      {lines.map((textGroup, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: index === activeLine ? 1 : 0.3,
            y: 0
          }}
          transition={{ duration: 0.5 }}
          className="transition-opacity duration-300"
        >
          <TypewriterText 
            texts={textGroup} 
            {...props}
            onComplete={() => {
              if (index < lines.length - 1) {
                setTimeout(() => setActiveLine(index + 1), lineDelay);
              }
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Add this to existing TypewriterText props interface
interface TypewriterTextProps {
  onComplete?: () => void;
}

export default TypewriterText;