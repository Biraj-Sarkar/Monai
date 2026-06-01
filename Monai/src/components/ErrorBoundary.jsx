import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log the error to an external service here
    // console.error('Unhandled UI error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white dark:bg-gray-900 border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">The application encountered an unexpected error. Try refreshing the page.</p>
            <div className="mt-4">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-900 text-white rounded">Reload</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
