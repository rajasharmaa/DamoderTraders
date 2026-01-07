// components/ParallaxSection.tsx
import { ReactNode, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  overlayColor?: string;
  image?: string;
  video?: string;
  blur?: number;
  opacity?: number;
  offset?: number;
}

const ParallaxSection = ({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  image,
  video,
  blur = 0,
  opacity = 1,
  offset = 0
}: ParallaxSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Calculate transform based on direction
  const getTransform = () => {
    const y = useTransform(scrollYProgress, [0, 1], [offset, offset - (speed * 100)]);
    const x = useTransform(scrollYProgress, [0, 1], [0, 0]);
    
    switch (direction) {
      case 'up':
        return { y: useTransform(scrollYProgress, [0, 1], [offset, offset - (speed * 100)]) };
      case 'down':
        return { y: useTransform(scrollYProgress, [0, 1], [offset, offset + (speed * 100)]) };
      case 'left':
        return { x: useTransform(scrollYProgress, [0, 1], [offset, offset - (speed * 100)]) };
      case 'right':
        return { x: useTransform(scrollYProgress, [0, 1], [offset, offset + (speed * 100)]) };
      default:
        return { y };
    }
  };

  const transform = getTransform();

  // Mouse parallax effect
  useEffect(() => {
    if (!containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const { clientX, clientY } = e;
      const { width, height, left, top } = container.getBoundingClientRect();
      
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;
      
      const moveX = (x - 0.5) * 20;
      const moveY = (y - 0.5) * 20;

      const bgElements = container.querySelectorAll('.parallax-bg-element');
      bgElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.2);
        (element as HTMLElement).style.transform = 
          `translate(${moveX * speed}px, ${moveY * speed}px)`;
      });
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Background Container */}
      <div className="absolute inset-0 overflow-hidden">
        {image && (
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${image})`,
              filter: `blur(${blur}px)`,
              opacity,
              scale: 1.1,
              ...transform
            }}
          />
        )}
        
        {video && (
          <motion.video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: `blur(${blur}px)`,
              opacity,
              scale: 1.1,
              ...transform
            }}
          >
            <source src={video} type="video/mp4" />
          </motion.video>
        )}
        
        {/* Multiple parallax layers for depth */}
        <div className="parallax-bg-element absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent opacity-50" />
        <div className="parallax-bg-element absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 opacity-30" />
        
        {/* Overlay */}
        {overlayColor && (
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: overlayColor }}
          />
        )}
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-600/10 opacity-50" />
        
        {/* Floating particles in background */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                scale: Math.random()
              }}
              animate={{
                y: [null, `calc(${Math.random() * 100}% + 100px)`],
                x: [null, `calc(${Math.random() * 100}% + 50px)`],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};

// Advanced Parallax with multiple layers
export const MultiLayerParallax = ({
  layers = [
    { image: '', speed: 0.2, blur: 0, opacity: 1 },
    { image: '', speed: 0.4, blur: 2, opacity: 0.8 },
    { image: '', speed: 0.6, blur: 4, opacity: 0.6 }
  ],
  children,
  className = ''
}: {
  layers?: Array<{
    image: string;
    speed: number;
    blur: number;
    opacity: number;
  }>;
  children: ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  return (
    <div ref={containerRef} className={`relative h-screen overflow-hidden ${className}`}>
      {/* Multiple parallax layers */}
      {layers.map((layer, index) => (
        <motion.div
          key={index}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${layer.image})`,
            y: useTransform(scrollYProgress, [0, 1], [0, layer.speed * 100]),
            scale: 1.1,
            filter: `blur(${layer.blur}px)`,
            opacity: layer.opacity
          }}
        />
      ))}
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// Scroll-triggered parallax
export const ScrollParallax = ({ 
  children, 
  triggerOffset = 100,
  className = ''
}: { 
  children: ReactNode;
  triggerOffset?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${triggerOffset}px end`, "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ scale, opacity }}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxSection;