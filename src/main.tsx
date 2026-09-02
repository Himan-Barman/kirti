import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { StoreProvider } from './lib/store.tsx';
import { AuthProvider } from './lib/auth.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </AuthProvider>
  </React.StrictMode>,
);
