import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Auth } from 'aws-amplify';

import { FormControl, InputLabel, Stack, Select, MenuItem, Box, TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, SInfoContext, MapQContext} from "../../context"
import { COURSEBLANK , GEOJSONBLANK} from '../../constant/urlconstants';
import { BASEURL } from '../../constant/urlconstants.js';
import DSPolyHSTEdit from "../DSBasics/DSPolyHSTEdit"



export default function DSSave() {

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
  const {geojsoninfo, setGeoJsonInfo,targetpolygons, setTargetPolygons, targetpoints, setTargetPoints, isLoading, setIsLoading} = useContext(MapQContext);


  const handleAdd = () => { 

    if(selected_course_info === null) return


    let new_course_info = [
      ...baseinfo.course_info.filter((x)=> x.id !== selected_course_info.id),
      {...selected_course_info, map_info:mapinfo, course_names: [...selected_course_info.course_names]}
    ]

    let new_area_def = [...baseinfo.area_def]

    PostBaseInfo({...baseinfo, area_def:new_area_def, course_info:new_course_info}).then(setBaseInfo({...baseinfo, course_info:new_course_info}));

    let geojsoninfo_ = {};

    if(selected_mode === "SearchSelected") geojsoninfo_ = {...JSON.parse(JSON.stringify(GEOJSONBLANK))}
    else geojsoninfo_ = {...geojsoninfo}

    // console.log("Saved Polgon:",  geojsoninfo_ )

    

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
        <Stack direction="column" spacing={0}   justifyContent="space-between"  alignItems="center" mt = {0}>
          <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={2}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
            <Button variant="outlined"  disabled = {selected_mode === "MAPGEOJSONEDIT"}
            onClick={() => {handleAdd();selected_mode === "SearchSelected"? setMode("CourseSearch"): setMode("MAPEdit")}}> Save</Button>
            <Button variant="outlined"  onClick={() => {selected_mode === "SearchSelected"? setMode("CourseSearch"): setMode("MAPSelect");setCourse("MGC000")}}> Cancel/Back</Button>
          </ButtonGroup>
        </Stack>
      }
    </>
  );
}