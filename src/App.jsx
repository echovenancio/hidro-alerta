import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Login from "./Login";
import Signup from "./Signup";
import Ajustes from "./Ajustes";
import MapaPage from "./Mapapage"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Hero />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ajustes" element={<Ajustes/>}/>
        <Route path="/mapa" element={<MapaPage />} />
      </Routes>
    </Router>
  );
}

export default App;