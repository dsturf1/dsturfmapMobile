import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { Box, Button, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress} from '@mui/material';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';

import { BaseContext, MapQContext, MapCRSQContext} from "../../context"
import DSWorkMap from './DSWorkMap.js';
import DSWorkInfo from './DSWorkInfo.js';

import DSicon1 from '../DSicon1.js';

import DSCoursePicker from '../DSBasics/DSCoursePicker.js';
import DSPhotoUpload from '../DSBasicsPhoto/DSPhotoUpload.js';


export default function DSWorkMain(props) {
  
  const {geojsoninfo, setGeoJsonInfo,tpoly, setTPoly,
    targetpolygons, setTargetPolygons, targetpoints, setTargetPoints, isLoading, setIsLoading} = useContext(MapQContext);
  const {isCRSLoading, setIsCRSLoading, greenpoly, setGreenPoly, 
    holepoly, setHolePoly, coursepoly, setCoursePoly, selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, 
    loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo, 
    selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);


    useEffect(() => {

      const onBackButtonEvent = (e) => {
        e.preventDefault();
        setCourse('MGC000')
      }
  
      window.history.pushState(null, null, window.location.pathname);
      window.addEventListener('popstate', onBackButtonEvent);
      return () => {
        window.removeEventListener('popstate', onBackButtonEvent);  
      };
      
    }, [selected_course]);
  
    // useEffect(() => {
  
    //   const onBackButtonEvent = (e) => {
    //     e.preventDefault();
    //     if(edited === false ) {
    //       if(selected_mode === 'Internal') {
    //         if(selected_date === 'NA') {selected_course === 'GC000'? setMode('Plan'):setCourse('GC000')}
    //         else setDate('NA')
    //       }
    //       else if (selected_mode === 'PlanEdit') { 
    //         if(selected_course === 'GC000' && selected_date === 'NA') setMode('Plan');
    //         else {setCourse('GC000');setDate('NA')}
    //       }
    //       else if (selected_mode === 'ReportUpload') { 
    //         setMode('Internal')
    //       }
    //       else {
    //         setCourse('GC000');setDate('NA');setMode('Plan')
    //       }
    //     }
    //     else {
        
    //       if(window.confirm('저장하지 않으면 수정된 정보가 유실됩니다.')) {          
    //         if(selected_mode === 'Internal') {
    //           if(selected_date === 'NA') {selected_course === 'GC000'? setMode('Plan'):setCourse('GC000')}
    //           else setDate('NA')
    //         }
    //         else if (selected_mode === 'PlanEdit') { 
    //           if(selected_course === 'GC000' && selected_date === 'NA') setMode('Plan');
    //           else {setCourse('GC000');setDate('NA')}
    //         }
    //         else if (selected_mode === 'ReportUpload') { 
    //           setMode('Internal')
    //         }
    //         else {
    //           setCourse('GC000');setDate('NA');setMode('Plan')
    //         }
    //         setEdited(false)
    //       }      
    //     }
    //   }
  
    //   window.history.pushState(null, null, window.location.pathname);
    //   window.addEventListener('popstate', onBackButtonEvent);
    //   return () => {
    //     window.removeEventListener('popstate', onBackButtonEvent);  
    //   };
    // }, [selected_course, selected_date, edited, selected_mode]);
  
    // const main_display= () => {
    //   switch(selected_mode) {
  
    //     case "Plan":   return <DSWorkSchedule/>;
    //     case "ReportUpload":   
    //     case "Internal":   return selected_course === 'GC000' || selected_course === 'NA'? <CoursePicker/>:
    //         selected_date === 'NA'? <DatePicker />:
    //         <WorkQSProvider>
    //           <WorkEdit/>
    //         </WorkQSProvider>
    //     default:      return <h1>No project match</h1>
    //   }
    // }
  
  
    return (
      <Fragment>
        <Grid item xs={12}>
          <Box sx={{ p: 0, border: '1px solid grey',gap: 1, borderRadius: 1 }}>
            <Stack direction="row" spacing={2}   justifyContent="center"  alignItems="center" mt = {1} color = "primary" >
              <DSicon1 />
              <Typography variant="h6" component="h6" justifyContent="center"  alignItems="center" sx={{ display: 'flex', flexWrap: 'wrap' } } color="primary">
                골프장 위치추적
              </Typography>
              <Typography variant="subtitle1" gutterBottom color="primary"sx={{ fontSize: 12, fontWeight: 'medium' }}>작성자:{loginuser}</Typography>
            </Stack>
            <Stack direction="row" spacing={2}   justifyContent="center"  alignItems="center" m = {1} color = "primary" >
              <Button variant="contained" size="small" endIcon={<GolfCourseIcon />} 
                  sx={{fontSize: 12}} onClick={()=>setCourse('MGC000')}> 골프장선택 </Button>
              <Button variant="contained" size="small" endIcon={<ExitToAppOutlinedIcon />} 
                  sx={{fontSize: 12}} onClick={props.signOut}> 나가기 </Button>
              {Object.keys(baseinfo).length !== 0 && isLoading === false &&
                <Button variant="outlined" size="small"  
                  sx={{fontSize: 12}} > 
                  {selectedBoxpoly.data.properties.Hole === 0? 
                    targetpolygons.data.features.filter((x)=>x.properties.Course===selectedBoxpoly.data.properties.Course).length:
                    targetpolygons.data.features.filter((x)=>x.properties.Course===selectedBoxpoly.data.properties.Course && x.properties.Hole===selectedBoxpoly.data.properties.Hole).length} / 
                  {targetpolygons.data.features.length}
                  
                  </Button>}
            </Stack>
  
          </Box>
        </Grid>
      
        <Grid item xs={12}>
          <Box sx={{ p: 1, border: '1px solid grey',gap: 1, borderRadius: 1 }} >
          { 
            Object.keys(baseinfo).length === 0 ?
              <div
                style={{
                  // do your styles depending on your needs.
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                <CircularProgress />
              </div>
              // :(selected_course === "MGC000" ? <DSCoursePicker/>:(isLoading === true || isCRSLoading === true? null:<DSWorkMap/>))
              // :(selected_course === "MGC000" ? <DSCoursePicker/>:<DSWorkMap/>)
              :<DSPhotoUpload/>
          }
          </Box>
        </Grid>
      </Fragment>
    );
  }