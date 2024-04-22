// playerorigin (verantwortlich: Silvan)
// Inhalt: originmap, toolbar, ...

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import HomeIcon from '@mui/icons-material/Home';

import './playerorigin.css';
import appbarstyle from './appbarstyle.js';

import { useNavigate } from "react-router-dom";

const Playerorigin = (props) => {
  const [club, setClub] = React.useState('FC Luzern');
  const navigate = useNavigate();

  const handleChange = (event) => {
    setClub(event.target.value);
  };

  return (
    <div>
      <AppBar position="static" style={appbarstyle.appBar}>
        <Toolbar className="Toolbar" style={{ justifyContent: 'space-between' }}>
          <Button
            style={appbarstyle.button}
            startIcon={<HomeIcon style={{ color: '#f7da00' }} />}
            onClick={() => {
              // Hier den setUser-Aufruf entfernen oder anpassen
              navigate("/");
            }}
          >
            FootballMap
          </Button>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="club-label" style={{ color: '#f7da00' }}>Club</InputLabel>
                <Select
                  labelId="club-label"
                  id="club-select"
                  value={club}
                  onChange={handleChange}
                  style={{ color: 'white' }}
                >
                  <MenuItem value="FC Luzern">FC Luzern</MenuItem>
                  <MenuItem value="FC Basel">FC Basel</MenuItem>
                  <MenuItem value="FC Sion">FC Sion</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="Title" style={appbarstyle.title}>
              Player Origin
            </div>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Playerorigin;
