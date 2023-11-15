import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, List, 
  Typography, Button,ButtonGroup, Stack, IconButton, Box, Paper} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';
import DSPhotoHSTEdit from "../DSBasicsPhoto/DSPhotoHSTEdit"
import DSAreaPolyHSTEdit from "./DSAreaPolyHSTEdit"
import DSSave from './DSAreaSave';
import DSAreaLabelHSTEdit from './DSAreaLabelHSTEdit';

import { BaseContext, MapQContext, MapCRSQContext} from "../../context"
import { MuiFileInput } from 'mui-file-input'
import exifr from 'exifr'
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, bbox as turfbbox ,centroid as turfcentroid} from "@turf/turf";

export default function DSAreaPicker() {


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo,selected_polygon, setPolyGon} = useContext(BaseContext);
  const {CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, CRStpoly, setCRSTPoly,  
    holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);    
  const {geojsoninfo, setGeoJsonInfo,tpoly, setTPoly,targetpolygons, setTargetPolygons, 
    targetpoints, setTargetPoints, isLoading, setIsLoading} = useContext(MapQContext);
  const [imgFiles, setImgFiles] = React.useState([])
  const [imgFileInfos, setImgFileInfos] = React.useState([])
  const [selectedIndex, setSelectedIndex] = React.useState(-1);


  const DSList = ({ polys_ }) => {
    const list = polys_.sort((a,b) => a.TypeId - b.TypeId).map((poly_, index) => {
      return (
        <ListItem
          key={'DSArea' + index}
          disablePadding
        >
          <ListItemButton
            selected={selectedIndex === index}
            onClick={() => {          
              setPolyGon({...poly_})
              setSelectedIndex(index);
            }}    
            sx={{
              "&.Mui-selected": {
                backgroundColor: "#063970"
              },
              "&.Mui-focusVisible": {
                backgroundColor: "#035efc"
              },
              ":hover": {
                backgroundColor: "#f0f4fa"
              }
            }}
          >
            <ListItemText id={'DSAreaText' + index} 
              primary={
              <Stack direction="column" justifyContent="space-between" >
                <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {(index + 1)+"."+ poly_.properties.Course +'['+poly_.properties.Hole+']' +(poly_.properties.LabelL1)}
                </Typography>
              </Stack>
              } 
            />
          </ListItemButton>
        </ListItem>
      )
    })
    return list
  }

  useEffect(() => {

    if (selected_polygon === null) {setSelectedIndex(-1) ;return}
  

    tpoly.forEach(function (poly_, i) {
      if (poly_.properties.Id === selected_polygon.properties.Id) setSelectedIndex(i)
    });
    
    }, [selected_polygon])

 
  return (
    <Paper style={{height: '100%'}}>
      <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={0}   justifyContent="center"  alignItems="center" sx={{ mt: 0 , height: '5vh'}}>
        <Button variant= {selected_mode === "MAPEdit"? "outlined":"contained"}  onClick={() => {
          selected_mode === "MAPEdit"? setMode("MAPGEOJSONEDIT"):setMode("MAPEdit")}}> 
            {(selected_mode === "MAPEdit"? "신규/수정모드":"신규/수정모드 종료")}
        </Button>
      </ButtonGroup>
      <Box sx={{ height: '85vh', width: '100%' }}>
        <Box sx={{height: '30vh', 
                  display: 'block',
                  p: 1,
                  // mx: 1,
                  overflow: 'auto',
                  border: 0
                }}>
          <List dense={true}>
            {tpoly.length > 0? <DSList polys_ = {tpoly}/>:null}
          </List>      
        </Box>
        <Box  sx={{height: '25vh',                   border: 0 }}
              display='block'
              alignItems="center"
              justifyContent="center"
        >
                <DSAreaPolyHSTEdit />

        </Box>
        <Box sx={{height: '25vh',                   border: 0 }}
                      display='block'
                      alignItems="center"
                      justifyContent="center"
                >
          <DSAreaLabelHSTEdit/>

        </Box>
        <DSSave/>
      </Box>
    </Paper>
  );
}


