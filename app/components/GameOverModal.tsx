interface GameOverModalProps {
  frequency: number;
  onRestart: () => void;
  buttonText?: string;
}

export default function GameOverModal({
  frequency,
  onRestart,
  buttonText = "Restart",
}: GameOverModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Grid Failure!</h2>
        <p className="text-gray-700 mb-6">
          The grid frequency deviated too far from 50 Hz (Current:{" "}
          {frequency.toFixed(3)} Hz). This would have caused widespread
          blackouts and equipment damage.
        </p>
        <button
          onClick={onRestart}
          className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
