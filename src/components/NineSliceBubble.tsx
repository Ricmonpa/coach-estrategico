import React from 'react';

interface NineSliceBubbleProps {
  children: React.ReactNode;
  className?: string;
}

const NineSliceBubble: React.FC<NineSliceBubbleProps> = ({ children, className = '' }) => {
  return (
    <div className={`nine-slice-bubble ${className}`}>
      {/* Top row */}
      <div className="bubble-row top-row">
        <div className="corner top-left"></div>
        <div className="border top-border"></div>
        <div className="corner top-right"></div>
      </div>
      
      {/* Middle row */}
      <div className="bubble-row middle-row">
        <div className="border left-border"></div>
        <div className="content-area">
          {children}
        </div>
        <div className="border right-border"></div>
      </div>
      
      {/* Bottom row */}
      <div className="bubble-row bottom-row">
        <div className="corner bottom-left"></div>
        <div className="border bottom-border"></div>
        <div className="corner bottom-right"></div>
      </div>
    </div>
  );
};

export default NineSliceBubble;
