import React,{useEffect} from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './components/Home/index'
import NavbarComponent from './components/Navbar/index'
import './App.css';
import  BuyerPortal  from "./components/Buyer/index";
import { useWeb3React } from '@web3-react/core'
import { injected } from './utils/connectionHelper';

function App() {

  useEffect(()=>{
    
  },[])

  
  return (
    <>
    <NavbarComponent/>
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/buyer' element={<BuyerPortal/>}/>

      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
