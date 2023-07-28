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
  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord} = useContext(SInfoContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId} = useContext(BaseContext);

  useEffect(() => {
    if (Object.keys(baseinfo).length === 0) return

    console.log(baseinfo)

  },[baseinfo]);

  const handleAdd = () => { 
    if(selected_info === null) return

    let add_info = {...JSON.parse(JSON.stringify(COURSEBLANK)),
    id:"MGC"+(maxid+1).toString().padStart(3, '0'),
    name:selected_info.place_name    ,
    address:selected_info.address_name,
    center:[Number(selected_info.x),Number(selected_info.y)]
    };

    let new_course_info = [...baseinfo.course_info,add_info]
    let new_area_def = [...baseinfo.area_def]
    // console.log({area_info:baseinfo.area_def, course_info:new_course_info});

    PostBaseInfo({area_def:new_area_def, course_info:new_course_info}).then(setBaseInfo({...baseinfo, course_info:new_course_info}));

    let map_info = {...JSON.parse(JSON.stringify(MAPBLANK))}

    PostMapInfo(map_info, "MGC"+(maxid+1).toString().padStart(3, '0'))



  }

  const PostBaseInfo = async function (baseinfo_) 
{

    const url_ = BASEURL + '/baseinfo?'+  new URLSearchParams({user: baseinfo.user.username });
    const myInit = {
      method: 'POST',
      body: JSON.stringify( baseinfo_),
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    try {
        const fetchData = await fetch(url_, myInit).then((response) => response.json())
        console.log('At Post', fetchData)
        return fetchData
        } catch (err) { console.log('Workinfo Saving Error', err, url_); return err; }
 
}

const PostMapInfo = async function (mapinfo_, id_) 
{

  const url_ = BASEURL + '/geojson/'+baseinfo.user.username +'?'+  new URLSearchParams({courseid: id_.toString() });
  const myInit = {
    method: 'POST',
    body: JSON.stringify( mapinfo_),
    headers: {
      Authorization: `Bearer ${(await Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  try {
      const fetchData = await fetch(url_, myInit).then((response) => response.json())
      console.log('At Post Map', fetchData)
      return fetchData
      } catch (err) { console.log('Workinfo Saving Error', err, url_); return err; }
 
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