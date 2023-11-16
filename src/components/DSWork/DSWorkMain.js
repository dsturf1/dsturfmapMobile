import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Paper } from '@mui/material';
import { BaseContext, MapQContext, MapCRSQContext} from "../../context"
import DSWorkMap from './DSWorkMap.js';
import DSWorkInfo from './DSWorkInfo.js';


export default function DSWorkMain({geojson_mode}) {
  
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

        <Grid Grid item xs={12} md={6}>
          <Box height="100%" sx={{ p: 0, border: '1px solid gray',gap: 1, borderRadius: 0 , m: 0}}>
            {/* <DSPolySelect geojson_mode={geojson_mode}/> */}
            <DSWorkMap/>
          </Box>
        </Grid>
        <Grid Grid item xs={12} md={6}>
          <Box height="100%" sx={{ p: 0, border: '1px solid gray',gap: 0, borderRadius: 0 , m: 0}}>
            {/* <DSPolySelect geojson_mode={geojson_mode}/> */}
            <DSWorkInfo/>
          </Box>
        </Grid>
      </Grid>    
    </div>  
  );
}