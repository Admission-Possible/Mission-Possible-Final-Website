import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/site.css';

const root = document.getElementById('root')!;
const tree = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, tree);
else ReactDOM.createRoot(root).render(tree);
