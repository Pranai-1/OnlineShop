// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OnlineShop from './OnlineShop';
import Manager from './Manager';

function App() {
  return (
    <Router>
      <Routes>
        {/* Define the route with query parameters */}
        <Route path="/onlineshoplink" element={<OnlineShop />} />
        <Route path="/manager" element={<Manager />} />
      </Routes>
    </Router>
  );
}

export default App;
