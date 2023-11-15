

import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Auth } from 'aws-amplify';

import { FormGroup, FormControlLabel, InputLabel, Stack, Select, MenuItem, Box, Checkbox,TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, SInfoContext, MapQContext} from "../../context/index.js"
import { COURSEBLANK , GEOJSONBLANK} from '../../constant/urlconstants.js';
import { BASEURL } from '../../constant/urlconstants.js';


export default function DSPolySelect({geojson_mode}) {

  
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, 
    setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo} = useContext(BaseContext);
  const handleChange = (event) => {

    setBaseInfo({
      ...baseinfo, area_def:[...baseinfo.area_def.filter((x)=>x.name !== event.target.name),
        {...baseinfo.area_def.filter((x)=>x.name === event.target.name)[0], 
          display: event.target.checked}].sort((a, b) => a.TypeId - b.TypeId)})
  };

  return (
    <Box
          sx={{
            width:'100%',
            backgroundColor: '#e5e5e5',
          }}
        >
    <FormGroup       row = {true} sx ={{m : 0}}>
      {baseinfo.area_def.filter((item) =>  item.area_def === (geojson_mode === "AREA") || item.work_def === (geojson_mode === "JOBS")).map((x)=>
      <FormControlLabel sx ={{m : 0}}
      control={
        <Checkbox 
          checked={x.display}
          size="small"         
                    sx={{
          color: x.color,
          '&.Mui-checked': {
            color: x.color,
          },
          }}
          name = {x.name}
          onChange={handleChange}
          />} 
          label={
            <Box component="div" fontSize={15} m={0}>
           {x.name}
             </Box>
       } />
        )}

    </FormGroup>
    </Box>

  );
}
