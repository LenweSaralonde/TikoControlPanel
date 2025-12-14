import React, { ReactNode, useEffect } from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from "react-error-boundary";

interface ErrorBoundaryProps {
  children: ReactNode;
}

function DefaultFallback({ resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      const timer = setTimeout(() => {
        resetErrorBoundary();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [resetErrorBoundary]);

  return (
    <div className="app error">
      <div className="error-message">
        <h2>Connection error</h2>
        <button onClick={resetErrorBoundary}>Reload</button>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={DefaultFallback}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
}
