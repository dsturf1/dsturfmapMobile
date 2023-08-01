import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Auth } from 'aws-amplify';

import { FormControl, InputLabel, Stack, Select, MenuItem, TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, SInfoContext, MapQContext} from "../../context"
import { COURSEBLANK , GEOJSONBLANK} from '../../constant/urlconstants';
import { BASEURL } from '../../constant/urlconstants.js';


export default function DSInfoEdit() {

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo} = useContext(BaseContext);
  const {geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading} = useContext(MapQContext);
  const [numHole, setNumHole] = React.useState(9);
  const Textrefs = useRef([]);

  const DSList = () => {

    let list = Array.from({length: parseInt(selected_course_info.numHole/9)}, (_, i) => i + 1);
    Textrefs.current = list.map(() => createRef());


    let Tlist = list.map((x, index) =>
        <Stack direction="row" spacing={1}   justifyContent="space-between"  alignItems="center" mt = {1}>
          <Typography variant="caption"> 제 {x} 코스명</Typography>
          <Input id={"ds-course-name" + x}  size="small" value ={selected_course_info=== null? "코스명" + x:selected_course_info.course_names[index]} variant="filled" inputRef={Textrefs.current[index]} Ref={Textrefs.current[index]}
           onKeyPress= {(e) => {
            if (e.key === 'Enter') {
              if (Textrefs.current[index+1]) Textrefs.current[index+1].current.focus(); 
            }
          }}
          />
        </Stack>
      )

    return Tlist
  }

  const handleAdd = () => { 

    if(selected_course_info === null) return

    let new_course_info = [...baseinfo.course_info.filter((x)=> x.id !== selected_course_info.id),{...selected_course_info, map_info:mapinfo}]
    let new_area_def = [...baseinfo.area_def]

    PostBaseInfo({area_def:new_area_def, course_info:new_course_info}).then(setBaseInfo({...baseinfo, course_info:new_course_info}));

    let geojsoninfo_ = {};

    if(selected_mode === "NewAddtoDB") geojsoninfo_ = {...JSON.parse(JSON.stringify(GEOJSONBLANK))}
    else geojsoninfo_ = {...JSON.parse(JSON.stringify(geojsoninfo))}

    PostGeoJsonInfo(geojsoninfo_, selected_course_info.id);


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
  
  const PostGeoJsonInfo = async function (mapinfo_, id_) 
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
    <>
    {selected_course_info === null? null:
    <Fragment>
      {/* <Stack direction="column" spacing={0} alignItems="center" mt = {1}> */}
        <Stack direction="row" spacing={2}   justifyContent="space-between"  alignItems="center" mt = {0}>
          <Typography variant="body2" style={{ fontWeight: 'bold'}} > Zoom Level </Typography>
          <Typography variant="caption"  > {mapinfo.level}</Typography>
        </Stack>
        <Stack direction="row" spacing={0}   justifyContent="space-between"  alignItems="center" mt = {1} mb = {2}>
          <Typography variant="body2" style={{ fontWeight: 'bold'}} > Center(Lng,Lat) </Typography>
          <Typography variant="caption" > {mapinfo.center[0].toFixed(8)}, {mapinfo.center[1].toFixed(8)}</Typography>          
        </Stack>
        <Typography variant="body2" style={{ fontWeight: 'bold'}} > Boundary </Typography>
        <Stack direction="row" spacing={0}   justifyContent="space-between"  alignItems="center" mt = {1}>
          <Typography variant="body2" > SW(Lng,Lat) </Typography>
          <Typography variant="caption" > {mapinfo.bounds.sw === []? null:mapinfo.bounds.sw[0].toFixed(8)}, {mapinfo.bounds.sw === []? null:mapinfo.bounds.sw[1].toFixed(8)}</Typography>          
        </Stack>
        <Stack direction="row" spacing={0}   justifyContent="space-between"  alignItems="center" mt = {1}>
          <Typography variant="body2" > NE(Lng,Lat) </Typography>
          <Typography variant="caption" > {mapinfo.bounds.ne === []? null:mapinfo.bounds.ne[0].toFixed(8)}, {mapinfo.bounds.ne === []? null:mapinfo.bounds.ne[1].toFixed(8)}</Typography>      
        </Stack>
      {/* </Stack> */}
      <Stack direction="column" spacing={0} alignItems="center" mt = {1}>
        <Stack direction="row" spacing={2}   justifyContent="space-between"  alignItems="center" mt = {2}>
          <Typography variant="button" > 홀수</Typography>
          <FormControl  size="small" sx = {{ color: 'text.secondary', fontSize: 14 }}>
            <InputLabel id="ds-numhole-select-label">Hole</InputLabel>
            <Select
              labelId="ds-numhole-select-label"
              id="ds-numhole-select"
              value={selected_course_info.numHole}
              label="홀수"
              size="small"
              onChange={(event) => {setSelectedCourseInfo({...selected_course_info, numHole:event.target.value})}}
            >
              {[9,18,27,36,45,54,63,72,81].map((x) =>  <MenuItem key={'Numhole'+x} value={x}>{x}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>

        <DSList/>
      </Stack>
      <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={2}   justifyContent="center"  alignItems="center" sx={{ mt: 5 }}>
        <Button variant="outlined"  onClick={() => {handleAdd();setMode("MAPEdit")}}> Save</Button>
        <Button variant="outlined"  onClick={() => {setMode("MAPEdit")}}> Cancel</Button>
        <Button variant="outlined"  onClick={() => {setMode("MAPSelect");setCourse("MGC000")}}> Back</Button>
      </ButtonGroup>
      </Fragment>
      }
    </>
  );
}