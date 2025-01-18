import React from "react";
import Image from "next/image";

interface FrequencyDialProps {
  frequency: number;
  onGameOver?: () => void;
}

export default function FrequencyDial({
  frequency,
  onGameOver,
}: FrequencyDialProps) {
  const minFreq = 48;
  const maxFreq = 52;
  const nominalFreq = 50;

  // Calculate the rotation angle for the needle
  const getRotation = () => {
    const percentage = ((frequency - minFreq) / (maxFreq - minFreq)) * 100;
    // Convert to degrees: -90 to 90 degrees for the semicircle
    return -90 + (percentage * 180) / 100;
  };

  // Check for game over condition
  React.useEffect(() => {
    if (Math.abs(frequency - nominalFreq) > 5) {
      onGameOver?.();
    }
  }, [frequency, onGameOver]);

  // Determine color based on frequency deviation
  const getColor = () => {
    const deviation = Math.abs(frequency - nominalFreq);
    if (deviation <= 0.2) return "text-green-500";
    if (deviation <= 0.5) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="relative w-[200px] mx-auto flex flex-col items-center">
      {/* Dial Container */}
      <div className="relative w-[200px] h-[100px]">
        {/* Background Image */}
        <Image
          src="/dial.png"
          alt="Frequency Dial"
          width={400}
          height={200}
          className="absolute top-0 left-0"
          priority
        />

        {/* Current Frequency Display */}
        <div
          className={`absolute top-[60px] left-1/2 transform -translate-x-1/2 text-xl font-bold ${getColor()}`}
        >
          {frequency.toFixed(2)} Hz
        </div>

        {/* Needle */}
        <div className="absolute left-1/2 bottom-0 origin-bottom transform -translate-x-1/2">
          <div
            className="w-[2px] h-[80px] bg-black"
            style={{
              transform: `rotate(${getRotation()}deg)`,
              transformOrigin: "bottom center",
              transition: "transform 0.3s ease-out",
            }}
          />
          {/* Needle Base Circle */}
          <div className="w-2 h-2 rounded-full bg-black absolute bottom-[-5px] left-[-3px]" />
        </div>
      </div>

      {/* Digital Display */}
      <div className={`text-center mt-4 text-2xl font-bold ${getColor()}`}>
        {frequency.toFixed(2)} Hz
      </div>
    </div>
  );
}
