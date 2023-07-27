import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { SInfoContext} from "../../context/DSSearchData.js"

export default function DSNaverCommand() {

  const [inputword, setInpuWord] = useState('골프장');
  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord} = useContext(SInfoContext);

  useEffect(() => {

  },[]);
 
  return (
    <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }} >
      <TextField
        id="ds-search-word"
        label="검색골프장"
        value={inputword}
        onChange={(event) => {
          setInpuWord(event.target.value);
        }}
        onKeyPress={(ev) => {
          if (ev.key === 'Enter') {
            setSearchWord(inputword)
            ev.preventDefault();
          }
        }}
      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={() => {setSearchWord(inputword)}}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}