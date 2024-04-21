import React from 'react';


import Startpage from './startpage.js';
import Squadoverview from './squadoverview.js';
import Playerorigin from './playerorigin.js';
import Transferhistory from './transferhistory.js';



const MainApp = () => {
  return (
    <div>

<div id="popup" className="ol-popup">
    <a href="#" id="popup-closer" className="ol-popup-closer">×</a>
    <div id="popup-content"></div>
</div>
      <Startpage />
    </div>
  );
};

export default MainApp;



