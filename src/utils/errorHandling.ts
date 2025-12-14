export function setupGlobalErrorHandlers() {
  if (typeof window === "undefined") {
    return;
  }

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    event.preventDefault();
  });

  // Handle global errors
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error || event.message);
  });

  // Log when the error handlers are set up
  if (process.env.NODE_ENV === "development") {
    console.log("Global error handlers initialized");
  }
}
