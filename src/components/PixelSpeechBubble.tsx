import React from 'react';

interface PixelSpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
}

const PixelSpeechBubble: React.FC<PixelSpeechBubbleProps> = ({ children, className = '' }) => {
  return (
    <div className={`pixel-speech-bubble ${className}`}>
      <div className="bubble-background">
        <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <filter id="pixelate">
              <feFlood floodColor="black" result="black"/>
              <feMorphology operator="dilate" radius="0.5"/>
            </filter>
          </defs>
          
          <g>
            {/* Background dark blue fill */}
            <rect x="4" y="4" width="320" height="120" fill="#0f172a" stroke="none"/>
            
            {/* Black border - top edge */}
            <rect x="0" y="0" width="328" height="4" fill="black"/>
            
            {/* Black border - bottom edge */}
            <rect x="0" y="124" width="328" height="4" fill="black"/>
            
            {/* Black border - left edge */}
            <rect x="0" y="0" width="4" height="128" fill="black"/>
            
            {/* Black border - right edge */}
            <rect x="324" y="0" width="4" height="128" fill="black"/>
            
            {/* Tail - simple pixel art triangle */}
            {/* Tail base connection */}
            <rect x="16" y="124" width="16" height="4" fill="black"/>
            
            {/* Tail dark blue fill */}
            <rect x="20" y="128" width="8" height="4" fill="#0f172a"/>
            <rect x="24" y="132" width="4" height="4" fill="#0f172a"/>
            
            {/* Tail black border */}
            <rect x="16" y="128" width="4" height="4" fill="black"/>
            <rect x="28" y="132" width="4" height="4" fill="black"/>
            
            {/* Shadow - first layer (4px offset) */}
            <rect x="4" y="128" width="328" height="4" fill="black"/>
            <rect x="328" y="4" width="4" height="128" fill="black"/>
            
            {/* Shadow - second layer (8px offset) */}
            <rect x="8" y="132" width="328" height="4" fill="black"/>
            <rect x="332" y="8" width="4" height="128" fill="black"/>
            
            {/* Tail shadow - first layer */}
            <rect x="20" y="132" width="16" height="4" fill="black"/>
            <rect x="32" y="136" width="4" height="4" fill="black"/>
            
            {/* Tail shadow - second layer */}
            <rect x="24" y="136" width="16" height="4" fill="black"/>
            <rect x="36" y="140" width="4" height="4" fill="black"/>
          </g>
        </svg>
      </div>
      <div className="bubble-content">
        {children}
      </div>
    </div>
  );
};

export default PixelSpeechBubble;
