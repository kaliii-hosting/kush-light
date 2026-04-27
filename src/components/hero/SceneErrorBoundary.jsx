import React from 'react'

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Scene Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Unable to load 3D scene</h2>
            <p className="text-gray-400">Please refresh the page to try again</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default SceneErrorBoundary