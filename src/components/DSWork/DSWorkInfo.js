import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Paper } from '@mui/material';
import { BaseContext, MapQContext, MapCRSQContext} from "../../context/index.js"

import DSInfoEdit from "../DSBasics/DSInfoHSTEdit.js"
import DSPolySelect from "../DSBasics/DSPolySelect.js"

import DSSave from '../DSBasics/DSSave.js';
import DSLabelHSTEdit from '../DSBascisArea/DSAreaLabelHSTEdit.js';

import DSCoursePicker from '../DSBasics/DSCoursePicker.js';
import DSWorkMap from './DSWorkMap.js';
import DSAreaPicker from '../DSBascisArea/DSAreaPickerSmall.js';
import DSAreaPolyHSTEdit from "../DSBascisArea/DSAreaPolyHSTEdit.js"
import DSPhotoUpload from '../DSBasicsPhoto/DSPhotoUpload.js';


export default function DSWorkInfo({geojson_mode}) {
  
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, 
    setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);


  useEffect(() => {
    setMode("MAPSelect");
    setCourse("MGC000")
  },[geojson_mode]);
 
  return (
    Object.keys(baseinfo).length === 0? 
    <CircularProgress />
    :
    <Stack direction="row" spacing={0}   justifyContent="center"  alignItems="center" mt = {0}> 
      <Box component="div" height="100%"  sx={{ width:1/3, p: 0, gap: 0, border: '1px solid gray',
        borderRadius: 0 , m: 1}}>            
          { selected_course === 'MGC000'? <DSCoursePicker/>:<DSAreaPicker geojson_mode={geojson_mode}/> }
      </Box>

      <Box component="div" height="100%" sx={{ width:2/3,p: 0, gap: 0, border: '1px solid gray',
        borderRadius: 0 , m: 1}}>            
        <DSPhotoUpload/>
      </Box>
    </Stack>   
  );
}