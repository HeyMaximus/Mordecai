import { render } from 'react-dom';
import React from 'react';
import App from './components/App.jsx';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App tab="home" />);