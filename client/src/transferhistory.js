// transferhistory (verantwortlich: Nando)
// Inhalt: historymap, toolbar, ...

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import HomeIcon from '@mui/icons-material/Home';

import './transferhistory.css';
import appbarstyle from './appbarstyle.js';

import { useNavigate } from "react-router-dom";

const Transferhistory = () => {
  const [player, setPlayer] = React.useState('Max Meyer');
  const navigate = useNavigate();

  const handleChange = (event) => {
    setPlayer(event.target.value);
  };

  return (
    <div>
      <AppBar position="static" style={appbarstyle.appBar}>
        <Toolbar className="Toolbar" style={{ justifyContent: 'space-between' }}>
          <Button
            style={appbarstyle.button}
            startIcon={<HomeIcon style={{ color: '#f7da00' }} />}
            onClick={() => {
              navigate("/");
            }}
          >
            FootballMap
          </Button>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="player-label" style={{ color: '#f7da00' }}>Player</InputLabel>
                <Select
                  labelId="player-label"
                  id="player-select"
                  value={player}
                  onChange={handleChange}
                  style={{ color: 'white' }}
                >
                  <MenuItem value="Max Meyer">Max Meyer</MenuItem>
                  <MenuItem value="Martin Frydek">Martin Frydek</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="Title" style={appbarstyle.title}>
              Transfer History
            </div>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Transferhistory;