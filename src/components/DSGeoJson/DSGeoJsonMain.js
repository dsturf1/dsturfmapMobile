import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Paper } from '@mui/material';
import { BaseContext, SInfoContext, MapQContext} from "../../context"

import DSInfoEdit from "../DSBasics/DSInfoHSTEdit.js"
import DSPolySelect from "../DSBasics/DSPolySelect"
import DSPolyHSTEdit from "../DSBasics/DSPolyHSTEdit"
import DSPolyJSONEdit from "../DSBasics/DSPolyJSONEdit"
import DSCoursePicker from './DSCoursePicker.js';
import DSGeoJsonMap from './DSGeoJsonMap.js';

export default function DSGeoJsonMain() {
  
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo} = useContext(BaseContext);


  useEffect(() => {
    setMode("MAPSelect");
  },[]);
 
  return (
  //   Object.keys(baseinfo).length === 0? 
  //   <CircularProgress />
  //   :

      <Grid container spacing={0}>
        <Grid Grid item xs={12} md={2}>
          <Box height="90vh" sx={{ p: 1, border: '1px solid gray',gap: 2, borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex'}}>
            {/* <Stack direction="row" spacing={2}   justifyContent="center"  alignItems="flex-start" mt = {2}>
              <DSMapCommand/>
            </Stack> */}
            {selected_course === 'MGC000'? 
              <DSCoursePicker/>
              :
              <Stack direction="column" spacing={2}   justifyContent="center"  alignItems="flex-start" mt = {2}>
                <DSInfoEdit/>
                {/* <DSPolySelect/> */}
              </Stack> 
            }
          </Box>
        </Grid>
        <Grid Grid item xs={12} md={10}>
          <Box height="90vh" sx={{ p: 1, border: '1px solid gray',gap: 0, borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex'}}>
            <DSPolySelect/>
            <DSGeoJsonMap/>
          </Box>
        </Grid>
        {/* <Grid Grid item xs={12} md={2}>
          <Box height="90vh" sx={{ p: 1, border: '1px solid gray',gap: 2, borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex'}}>
            {selected_course === 'MGC000'? 
              null
              :
              <DSPolyHSTEdit/>
            }
          </Box>
        </Grid> */}
      </Grid>      
  );
}