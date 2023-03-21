import logo from './logo.svg';
import './App.css';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Registration from './views/Registration';
import Navbar from './views/NavbarMenu';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/registration' element={<Registration />}/>
        </Routes>
      </Router>
  );
}

export default App;
