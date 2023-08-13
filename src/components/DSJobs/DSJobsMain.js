import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Paper } from '@mui/material';
import { BaseContext, SInfoContext, MapQContext} from "../../context"

import DSInfoEdit from "../DSBasics/DSInfoHSTEdit.js"
import DSPolySelect from "../DSBasics/DSPolySelect"
import DSPolyHSTEdit from "../DSBasics/DSPolyHSTEdit"

import DSCoursePicker from '../DSBasics/DSCoursePicker.js';
import DSJobsMap from './DSJobsMap.js';

export default function DSJobsMain() {
  
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, 
    setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
  const {geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading, tpoly, setTPoly} = useContext(MapQContext);


  useEffect(() => {
    setMode("MAPSelect");
    setCourse("MGC000")
  },[]);

  useEffect(() => {

    console.log("cousre", selected_course, "Mode", selected_mode, "PolyGon", selected_polygon)

  }, [selected_course, selected_mode, selected_polygon])
 
  return (
    Object.keys(baseinfo).length === 0? 
    <CircularProgress />
    :
    <Fragment>
      <Grid container spacing={0}>
        <Grid Grid item xs={12} md={2}>
          <Box height="90vh" sx={{ p: 1, border: '1px solid gray',gap: 2, borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex'}}>
            { selected_course === 'MGC000'? <DSCoursePicker/>:<DSInfoEdit/>}
          </Box>
        </Grid>
        <Grid Grid item xs={12} md={10}>
          <Box height="90vh" sx={{ p: 1, border: '1px solid gray',gap: 0, borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex'}}>
            <DSPolySelect area_def_flag={false}/>
            <DSJobsMap/>
          </Box>
        </Grid>
      </Grid>    
    </Fragment>  
  );
}