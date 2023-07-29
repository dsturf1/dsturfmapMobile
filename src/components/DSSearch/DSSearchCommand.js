import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';
import { Auth } from 'aws-amplify';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

import { BaseContext, SInfoContext} from "../../context"
import { COURSEBLANK , MAPBLANK} from '../../constant/urlconstants';
import { BASEURL } from '../../constant/urlconstants.js';

export default function DSSearchCommand() {

  const [inputword, setInpuWord] = useState();
  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord, addToDB, setAddToDB} = useContext(SInfoContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapBound, setMapBound} = useContext(BaseContext);

  useEffect(() => {
    if (Object.keys(baseinfo).length === 0) return

    console.log(baseinfo)

  },[baseinfo]);

  const handleAdd = () => { 

    if(selected_info === null) return
    if(baseinfo.course_info.filter((x)=> x.name === selected_info.place_name).length>0) {
      alert("중복된골프장이 있어요")
      return
    }
    setAddToDB(true)
  }


  return (
    <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }} >
      <TextField
        id="ds-search-word"
        label="검색골프장"
        // value={inputword}
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
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={() => {handleAdd()}}>
        <AddIcon />
      </IconButton>
    </Paper>
  );
}