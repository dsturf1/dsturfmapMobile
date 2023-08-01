import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Auth } from 'aws-amplify';

import { FormControl, InputLabel, Stack, Select, MenuItem, Box, TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, SInfoContext} from "../../context"
import { COURSEBLANK , GEOJSONBLANK} from '../../constant/urlconstants';
import { BASEURL } from '../../constant/urlconstants.js';

export default function DSSearchEdit() {

  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord,addToDB, setAddToDB, zoomlevel, setZoomLevel} = useContext(SInfoContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo} = useContext(BaseContext);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [numHole, setNumHole] = React.useState(9);
  const Textrefs = useRef([]);

  const DSList = () => {

    let list = Array.from({length: parseInt(numHole/9)}, (_, i) => i + 1);
    Textrefs.current = list.map(() => createRef());


    let Tlist = list.map((x, index) =>
        <Stack direction="row" spacing={1}   justifyContent="space-between"  alignItems="center" mt = {1}>
          <Typography variant="caption" style={{ fontWeight: 'bold'}}> 제 {x} 코스명</Typography>
          <Input id={"ds-course-name" + x}  size="small" label={"코스명" + x} variant="filled" inputRef={Textrefs.current[index]} Ref={Textrefs.current[index]}
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

    if(selected_info === null) return
    if(baseinfo.course_info.filter((x)=> x.name === selected_info.place_name).length>0) {
      alert("중복된골프장이 있어요")
      return
    }

    let add_info = {...JSON.parse(JSON.stringify(COURSEBLANK)),
    id:"MGC"+(maxid+1).toString().padStart(3, '0'),
    name:selected_info.place_name    ,
    address:selected_info.address_name,
    numHole:numHole,
    course_names:Textrefs.current.map((x)=>x.current.value),
    map_info:{...mapinfo}
    };

    let new_course_info = [...baseinfo.course_info,add_info]
    let new_area_def = [...baseinfo.area_def]
    // console.log({area_info:baseinfo.area_def, course_info:new_course_info});

    PostBaseInfo({area_def:new_area_def, course_info:new_course_info}).then(setBaseInfo({...baseinfo, course_info:new_course_info}));

    let geojson_info = {...JSON.parse(JSON.stringify(GEOJSONBLANK))}

    PostMapInfo(geojson_info, "MGC"+(maxid+1).toString().padStart(3, '0'));


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

  useEffect(() => {

    console.log(Textrefs)

  },[numHole]);

  const getAllCourseName = ()=>{
    console.log(Textrefs.current.map((x)=>x.current.value))
  }
 
  return (
    <>
      <Typography variant="body2" > Zoom Level {mapinfo.level}</Typography>
      <TableContainer component={Box}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Info Type</TableCell>
              <TableCell align="center">Longitude</TableCell>
              <TableCell align="center">Latitude</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow key={'mapinfo-center'}>
              <TableCell component="th" scope="row"> Center  </TableCell>
              <TableCell align="right">{mapinfo.center[0].toFixed(5)}</TableCell>
              <TableCell align="right">{mapinfo.center[1].toFixed(5)}</TableCell>
            </TableRow>
            <TableRow key={'mapinfo-bsw'}>
              <TableCell component="th" scope="row"> Bounds SW  </TableCell>
              <TableCell align="right">{mapinfo.bounds.sw[0].toFixed(5)}</TableCell>
              <TableCell align="right">{mapinfo.bounds.sw[1].toFixed(5)}</TableCell>
            </TableRow>
            <TableRow key={'mapinfo-bne'}>
              <TableCell component="th" scope="row"> Bounds NE </TableCell>
              <TableCell align="right">{mapinfo.bounds.ne[0].toFixed(5)}</TableCell>
              <TableCell align="right">{mapinfo.bounds.ne[1].toFixed(5)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="column" spacing={0} alignItems="center" mt = {1}>
        <Stack direction="row" spacing={2}   justifyContent="space-between"  alignItems="center" mt = {2}>
          <Typography variant="button" > 홀수</Typography>
          <FormControl  size="small" sx = {{ color: 'text.secondary', fontSize: 14 }}>
            <InputLabel id="ds-numhole-select-label">Hole</InputLabel>
            <Select
              labelId="ds-numhole-select-label"
              id="ds-numhole-select"
              value={numHole}
              label="홀수"
              size="small"
              onChange={(event) => {setNumHole(event.target.value)}}
            >
              {[9,18,27,36,45,54,63,72,81].map((x) =>  <MenuItem key={'Numhole'+x} value={x}>{x}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>

        <DSList/>
      </Stack>
      <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={2}   justifyContent="center"  alignItems="center" sx={{ mt: 5 }}>
        <Button variant="outlined"  onClick={() => {handleAdd();setAddToDB(false)}}> Save</Button>
        <Button variant="outlined"  onClick={() => {setAddToDB(false)}}> Cancel</Button>
      </ButtonGroup>
    </>
  );
}