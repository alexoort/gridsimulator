import React from "react";

interface FrequencyDialProps {
  frequency: number;
  onGameOver?: () => void;
}

export default function FrequencyDial({
  frequency,
  onGameOver,
}: FrequencyDialProps) {
  const minFreq = 45;
  const maxFreq = 55;
  const nominalFreq = 50;

  // Calculate the percentage for the dial position
  const percentage = ((frequency - minFreq) / (maxFreq - minFreq)) * 100;

  // Check for game over condition (±10% deviation)
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
    <div className="relative w-full max-w-[300px] mx-auto">
      {/* Dial background */}
      <div className="h-32 bg-gray-200 rounded-t-full overflow-hidden relative">
        {/* Frequency scale */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="w-full h-1 bg-gray-300 relative">
            {/* Scale markers */}
            {[45, 47.5, 50, 52.5, 55].map((mark) => (
              <div
                key={mark}
                className="absolute h-3 w-0.5 bg-gray-400"
                style={{
                  left: `${((mark - minFreq) / (maxFreq - minFreq)) * 100}%`,
                  top: "-6px",
                }}
              />
            ))}
          </div>
        </div>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-28 bg-red-500 origin-bottom transform -translate-x-1/2"
          style={{
            transform: `translateX(-50%) rotate(${(percentage - 50) * 1.8}deg)`,
          }}
        />
      </div>

      {/* Frequency display */}
      <div className={`text-center mt-4 text-2xl font-bold ${getColor()}`}>
        {frequency.toFixed(4)} Hz
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>45 Hz</span>
        <span>47.5 Hz</span>
        <span>50 Hz</span>
        <span>52.5 Hz</span>
        <span>55 Hz</span>
      </div>
    </div>
  );
}
