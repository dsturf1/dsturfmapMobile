

import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Auth } from 'aws-amplify';

import { FormGroup, FormControlLabel, InputLabel, Stack, Select, MenuItem, Box, Checkbox,TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, SInfoContext, MapQContext} from "../../context"
import { COURSEBLANK , GEOJSONBLANK, POLYGONBLANK} from '../../constant/urlconstants';
import { BASEURL } from '../../constant/urlconstants.js';
import {JsonEditor} from "react-jsondata-editor";


export default function DSPolyJSONEdit() {
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);

  const [input, setInput] = useState('')
  
  useEffect(() => {

    setInput(JSON.stringify(selected_polygon.properties));
    console.log(input)
  },[selected_polygon]);

  return (
    <JsonEditor jsonObject={input} onChange={(output)=>{console.log(output)}}/>

  )
  }
