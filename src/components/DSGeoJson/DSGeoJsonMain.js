import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Paper } from '@mui/material';
import { BaseContext, SInfoContext, MapQContext} from "../../context"

import DSInfoEdit from "../DSBasics/DSInfoHSTEdit.js"
import DSPolySelect from "../DSBasics/DSPolySelect"
import DSPolyHSTEdit from "../DSBasics/DSPolyHSTEdit"

import DSCoursePicker from '../DSBasics/DSCoursePicker.js';
import DSGeoJsonMap from './DSGeoJsonMap.js';
import DSAreaPicker from '../DSBasics/DSAreaPicker.js';

export default function DSGeoJsonMain({geojson_mode}) {
  
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
    <div>
      <Grid container spacing={0}>
        <Grid Grid item xs={12} md={2}>
          <Box component="div" height="90vh" sx={{ p: 2, border: '1px solid gray',gap: 2, 
          borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex', alignContent: 'flex-start'}}>            
            { selected_course === 'MGC000'? <DSCoursePicker/>:<DSInfoEdit geojson_mode={geojson_mode}/>}
          </Box>
        </Grid>
        <Grid Grid item xs={12} md={8}>
          <Box height="90vh" sx={{ p: 1, border: '1px solid gray',gap: 0, borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex'}}>
            {/* // Top menubar to select wichi area geojson selected */}
            <DSPolySelect geojson_mode={geojson_mode}/> 
            <DSGeoJsonMap geojson_mode={geojson_mode}/>
          </Box>
        </Grid>
        <Grid Grid item xs={12} md={2}>
          <Box component="div" height="90vh" sx={{ p: 2, border: '1px solid gray',gap: 2, 
          borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex', alignContent: 'flex-start'}}>            
            <DSAreaPicker geojson_mode={geojson_mode}/>
          </Box>
        </Grid>
      </Grid>    
    </div>  
  );
}