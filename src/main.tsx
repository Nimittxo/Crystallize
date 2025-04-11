import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Add Router here
import { StyledEngineProvider } from '@mui/material/styles';
import Dashboard from './Dashboard.tsx'; // Changed from App to Dashboard

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <Router>
        <Dashboard />
      </Router>
    </StyledEngineProvider>
  </React.StrictMode>
);