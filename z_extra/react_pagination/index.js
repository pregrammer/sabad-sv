import React from 'react';
import ReactDOM from 'react-dom';
import PaginatedItems from './App2';

ReactDOM.render(
  <React.StrictMode>
    <PaginatedItems itemsPerPage={3} />
  </React.StrictMode>,
  document.getElementById('root')
);
