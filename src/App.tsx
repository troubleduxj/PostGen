import React from 'react';
import { Editor } from '@/components/Editor';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Editor />
      </div>
    </ErrorBoundary>
  );
}

export default App;