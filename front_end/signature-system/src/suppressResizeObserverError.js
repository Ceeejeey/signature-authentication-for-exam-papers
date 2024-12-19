const suppressResizeObserverError = () => {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
      return;
    }
    originalError.call(console, ...args);
  };
};

export default suppressResizeObserverError;