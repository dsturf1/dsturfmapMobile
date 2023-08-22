import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';
import { Box, Button, ToggleButton, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress, TextField, InputAdornment} from '@mui/material';

import { BaseContext, MapQContext} from "../../context"
import { label_Level1_info,  label_Level2_info, turf_type } from '../../constant/urlconstants';


export default function DSPolyInfoEdit() {

  const {geojsoninfo, setGeoJsonInfo,targetpolygons, setTargetPolygons, targetpoints, setTargetPoints, 
    isLoading, setIsLoading,  holepoly, setHolePoly, coursepoly, setCoursePoly, selectedBoxpoly, setBoxPoly} = useContext(MapQContext);
    const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, beforeSave, setBS,
      loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo, 
      selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);

  return (
    <Stack direction="row" spacing={2}   justifyContent="center"  alignItems="center" mt = {2}> 
    <FormControl  sx={{ width: 1/4}} size="small">
      <InputLabel id="ds-labelL1-select-label"> 종류 L1 </InputLabel>
      <Select
        labelId="ds-labelL1-select-label"
        sx={{ fontSize:'small'}}
        id="ds-labelL1-select"
        value={selected_polygon.properties.LabelL1}
        label="LabelL1"
        onChange={(event) => {
          let newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, LabelL1:event.target.value}}; 
          setPolyGon({...newPolygon})
          setEdited(true)
          setBS(true)
          console.log(label_Level1_info.findIndex((item) => item === selected_polygon.properties.LabelL1))
      }}
      >
      {label_Level1_info.map((x)=>
        <MenuItem sx={{fontSize:'small'}} value={x}>{x}</MenuItem> 
      )}
      </Select>
    </FormControl>
      <FormControl  sx={{ width: 1/4}} size="small">
        <InputLabel id="ds-labelL1-select-label"> 종류 L2</InputLabel>
        <Select
          labelId="ds-LabelL2-select-label"
          sx={{ fontSize:'small'}}
          id="ds-LabelL2-select"
          value={selected_polygon.properties.LabelL2}
          label="LabelL2"
          SelectProps={{
            native: true,
          }}
          onChange={(event) => {
            let newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, LabelL2:event.target.value}}; 
            setPolyGon({...newPolygon})
            setEdited(true)
            setBS(true)
        }}
        >
        {label_Level2_info[label_Level1_info.findIndex((item) => item === selected_polygon.properties.LabelL1) <0? 0:label_Level1_info.findIndex((item) => item === selected_polygon.properties.LabelL1)].map((x)=>
          <MenuItem sx={{fontSize:'small'}} value={x}>{x}</MenuItem> 
        )}
        </Select>
      </FormControl>
      <FormControl  sx={{ width: 1/4}} size="small">
        <InputLabel id="ds-TurfType-select-label">TurfType</InputLabel>
        <Select
          labelId="ds-TurfType-select-label"
          sx={{ fontSize: 12}}
          id="ds-TurfType-select"
          value={selected_polygon.properties.TurfType}
          label="TurfType"
          SelectProps={{
            native: true,
          }}
          onChange={(event) => {
            let newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, TurfType:event.target.value}}; 
            setPolyGon({...newPolygon})
            setEdited(true)
            setBS(true)
        }}
        >
        {turf_type.map((x)=>
          <MenuItem sx={{fontSize:'small'}} value={x}>{x}</MenuItem> 
        )}
        </Select>
      </FormControl>
    {/* <Stack direction="row" spacing={0}   justifyContent="center"  alignItems="center" mt = {0} sx={{ width: 3/4}}> 
      <TextField
          id="outlined-multiline-static"
          label="특이사항"
          rows={1}
          placeholder='샘지기에게 설명을...'
          inputRef={DescRef}
          sx={{ width: 5/6}}
          disabled = {selected_polygon === null}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end"             onClick={()=>{
                if(selected_polygon === null) return
                let newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, Desc:DescRef.current.value}}            
                setPolyGon({...newPolygon})
                setEdited(true)
                setBS(true)
  
              }}>
                <SendIcon />
              </InputAdornment>
            ),
          }}
        />

    </Stack> */}
    <FormControl  sx={{ width: 1/4}}size="small">
      <InputLabel id="ds-radius-select-label">반경[m]</InputLabel>
      <Select
        labelId="ds-radius-select-label"
        sx={{ fontSize: 12, fontWeight: 'medium'}}
        id="ds-hole-select"
        value={selected_polygon.properties.radius}
        label="반경"
        onChange={(event) => {
          let newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, radius:Number(event.target.value)}}; 
          setPolyGon({...newPolygon})
          setEdited(true)
          setBS(true)
      }}
      >
      {[1,1.5,2,2.5,3,3.5,4,5,7.5,10,15,20,50].map((x)=>
        <MenuItem value={x}>{x}</MenuItem> 
      )}
      </Select>
    </FormControl>
  </Stack>
  );
}