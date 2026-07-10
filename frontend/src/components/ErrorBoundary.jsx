import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production, send this to a real logging service instead.
    console.error("Uncaught error in Marine Dashboard:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-slate-900 text-white">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-slate-400 max-w-sm">
            This panel hit an unexpected error. Reloading usually fixes it — if it keeps
            happening, please report it via Help Desk.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-[#c9a962] text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-[#dcc07f] transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
