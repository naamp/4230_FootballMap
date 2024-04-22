import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Startpage from './startpage.js';
import Squadoverview from './squadoverview.js';
import Playerorigin from './playerorigin.js';
import Transferhistory from './transferhistory.js';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Startpage/>}/>
        <Route path="/playerorigin" element={<Playerorigin/>}/>
        <Route path="/squadoverview" element={<Squadoverview/>}/>
        <Route path="/transferhistory" element={<Transferhistory/>}/>
      </Routes>
    </Router>
  );
};

export default App;