export function PageLoader() {
  return (
    <div>
      <div className="h-screen section-padding">
        <div className="flex flex-col items-center justify-center gap-4 relative h-full">
          <div className="flex flex-row gap-4 dots" aria-hidden="true">
            <div className="h-4 w-4 rounded-full gradient-background dot"></div>
            <div className="h-4 w-4 rounded-full gradient-background dot"></div>
            <div className="h-4 w-4 rounded-full gradient-background dot"></div>
          </div>
          <p className="text-center px-4">Loading...</p>
        </div>
        <style>{`
        .dots { display: flex; align-items: center; }
        .dot {
          width: 1rem; height: 1rem; border-radius: 9999px;
          background-color: #4b5563; /* tailwind bg-gray-600 */
          animation: dotPulse 900ms infinite ease-in-out;
        }
        .dot:nth-child(1){ animation-delay: 0ms; }
        .dot:nth-child(2){ animation-delay: 150ms; }
        .dot:nth-child(3){ animation-delay: 300ms; }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(1); background-color: #4b5563; }
          40% { transform: scale(1.35); background-color: #01516E; } 
        }
      `}</style>
      </div>
    </div>
  );
}
