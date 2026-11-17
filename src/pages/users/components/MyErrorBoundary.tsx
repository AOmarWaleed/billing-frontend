import React, { ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode; // The components wrapped by the ErrorBoundary
}

interface ErrorBoundaryState {
  hasError: boolean; // Tracks if an error has occurred
}

class MyErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    // Update state to show fallback UI
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong in GroupDataGride!</div>;
    }

    return this.props.children;
  }
}

export default MyErrorBoundary;
