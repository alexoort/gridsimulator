export default function GameOverModal({
  frequency,
  onRestart,
}: {
  frequency: number;
  onRestart: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Grid Collapse!</h2>
        <p className="text-gray-700 mb-4">
          The grid frequency deviated too far from 50 Hz (reached{" "}
          {frequency.toFixed(4)} Hz) causing a widespread blackout.
        </p>
        <p className="text-gray-600 mb-6">
          Try to maintain the frequency between 48 Hz and 52 Hz by balancing
          power generation with demand.
        </p>
        <button
          onClick={onRestart}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
        >
          Restart Simulation
        </button>
      </div>
    </div>
  );
}
