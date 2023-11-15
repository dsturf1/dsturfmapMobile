import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Paper } from '@mui/material';

import { SInfoProvider} from "../../context/DSSearchData.js"
import { BaseContext} from "../../context"
import DSSearchCommand from "./DSSearchCommand.js"
import DSSearchPicker from './DSSearchPicker.js';
import DSInfoEdit from "../DSBasicsCRS/DSInfoHSTEdit.js"

import DSSearchMap from './DSSearchMap.js';

export default function DSWorkUpdateMain() {

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo} = useContext(BaseContext);

  useEffect(() => {
    setMode("CourseSearch");
  },[]);
 
  return (
  //   Object.keys(baseinfo).length === 0? 
  //   <CircularProgress />
  //   :
    <SInfoProvider>      
      <Grid container spacing={0}>
        <Grid Grid item xs={12} md={2}>
          <Box height="90vh" sx={{ p: 1, border: '1px solid gray',gap: 2, borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex'}}>
            <Stack direction="row" spacing={2}   justifyContent="center"  alignItems="flex-start" mt = {2}>
              <DSSearchCommand/>
            </Stack>
             {selected_mode === "CourseSearch"? <DSSearchPicker/>:<DSInfoEdit geojson_mode={"AREA"}/>}
          </Box>
        </Grid>
        <Grid Grid item xs={12} md={10}>
          <Box height="90vh" sx={{ p: 1, border: '1px solid gray',gap: 2, borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex'}}>
            <DSSearchMap/>
          </Box>
        </Grid>
      </Grid>      
    </SInfoProvider>        

  );
}