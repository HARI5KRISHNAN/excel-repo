
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AuthWrapper } from './components/AuthWrapper';
import { CollaborationProvider } from './contexts/CollaborationContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <CollaborationProvider>
          <AuthWrapper>
            <App />
          </AuthWrapper>
        </CollaborationProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
