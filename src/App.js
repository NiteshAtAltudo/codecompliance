
import './App.css';
import HeaderComponent from './Components/HeaderComponent';

import { useState,useContext } from 'react';

import Accordion from './Components/Accordion';




function App() {

  return (
    <div style={{margin:"20px"}}>
      <HeaderComponent/>
      <Accordion/>
    </div>
  );
}

export default App;
