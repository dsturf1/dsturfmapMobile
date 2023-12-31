import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, List, 
  Typography, Button,ButtonGroup, Stack, IconButton, Box, Checkbox} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';
import DSPhotoHSTEdit from "./DSPhotoHSTEdit"

import { BaseContext, MapQContext, MapCRSQContext} from "../../context"
import { MuiFileInput } from 'mui-file-input'
import exifr from 'exifr'
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, bbox as turfbbox ,centroid as turfcentroid} from "@turf/turf";

export default function DSPhotoUpload({geojson_mode}) {


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo,selected_polygon, setPolyGon} = useContext(BaseContext);
  const {CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, CRStpoly, setCRSTPoly,  
    holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);    
  const {geojsoninfo, setGeoJsonInfo,tpoly, setTPoly,targetpolygons, setTargetPolygons, 
    targetpoints, setTargetPoints, isLoading, setIsLoading} = useContext(MapQContext);
  const [imgFiles, setImgFiles] = React.useState([])
  const [imgFileInfos, setImgFileInfos] = React.useState([])
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [checked, setChecked] = React.useState([]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };


  const DSList = ({ photos_ }) => {
    const list = photos_.map((photo_, index) => {
      // const newChecked = [...checked];
      // newChecked.push(index);
      // setChecked(newChecked);
      return (
        <ListItem
          key={'DSphotoUpload' + index}
          secondaryAction={
            <Checkbox
              edge="end"
              onChange={handleToggle(index)}
              checked={checked.indexOf(index) !== -1}
              inputProps={{ 'aria-labelledby': 'DSphotoUpload' + index }}
              // defaultChecked={true}
            />
          }
          disablePadding
        >
          <ListItemButton
            selected={selectedIndex === index}
            onClick={() => {          
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
            <ListItemAvatar>
              <Avatar
                alt={`thumb Not avaiable`}
                src={photo_.thumbUrl}
              />
            </ListItemAvatar>
            <ListItemText id={'DSphotoUploadText' + index} primary={
              // <Stack direction="column" justifyContent="space-between"  alignItems="center" >
              <Stack direction="column" justifyContent="space-between" >
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' , color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {(index + 1)+"."+ photo_.info.Course +'[' + photo_.info.Hole+']'}
                </Typography>
                <Typography variant="caption" style={{ color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {photo_.gps === undefined || photo_.gps=== null? 'No GPS info':(photo_.gps.longitude.toFixed(5) + ',' + photo_.gps.latitude.toFixed(5))}
                </Typography>
              </Stack>
            } />
          </ListItemButton>
        </ListItem>
      )
    })
    return list
  }

  const check_CRSandHole = (pnt_) =>
{
  let course_ = null;
  let hole_ = null;

  let search_holepoly = holepoly.data.features.filter((x)=> booleanPointInPolygon(pnt_, turfpolygon(x.geometry.coordinates)))

  if (search_holepoly.length === 0) search_holepoly = coursepoly.data.features.filter((x)=> 
      booleanPointInPolygon(pnt_, turfpolygon(x.geometry.coordinates)) && x.properties.Course !=='전코스')

  if (search_holepoly.length === 0) search_holepoly = coursepoly.data.features.filter((x)=> 
      booleanPointInPolygon(pnt_, turfpolygon(x.geometry.coordinates)) && x.properties.Course ==='전코스')

  // console.log(search_holepoly)
  
  if (search_holepoly.length !== 0) {
    course_ = search_holepoly[0].properties.Course;
    hole_ =  search_holepoly[0].properties.Hole;
  }
  else{
    course_ = '?';
    hole_ =  0;
  }

  return {Course:course_, Hole:hole_}
}

  const handleChange = (newValue) => {
    setImgFiles(newValue);
    setSelectedIndex(-1);
  }

  useEffect(() => {
    console.log('Files',imgFiles)

    const getFileInfoGPS = async(file_) =>{

      let date_ = null;
      let altitude_ = null;

      let thumb_ = await exifr.thumbnailUrl(file_)
      let exifs = await exifr.parse(file_)

      if (typeof exifs !== 'undefined'){
        if ('DateTimeOriginal' in exifs) date_ = exifs.DateTimeOriginal.toISOString().slice(0,19).replace('T',' ')
        if ('GPSAltitude' in exifs) altitude_ = exifs.GPSAltitude
      }

      let gps_ = await exifr.gps(file_)    

      let pt = gps_ === undefined? turfpoint([0,0]) : turfpoint([gps_.longitude, gps_.latitude])
      let info_ = check_CRSandHole(pt)

      if(gps_=== undefined) gps_ = {longitude:128.110 , latitude: 36.520}
      
      
      return {thumbUrl: thumb_, gps : gps_, altitude:altitude_, date:date_ , info:info_, by:loginuser}
      // return {thumbUrl: thumb_, gps : gps_, altitude:altitude_, date:date_ }
    }
    const getAllInfos = async(files_) =>{
      return await Promise.all(files_.map((x)=> getFileInfoGPS(x)))
    }

    getAllInfos(imgFiles).then((results_) => {setImgFileInfos(results_); console.log(results_)})

    setChecked([...Array(imgFiles.length).keys()]);

    

  },[imgFiles]);

  const updatenewInfo = (val) =>{
    const newArray = [...imgFileInfos]
    newArray[selectedIndex] = val
    setImgFileInfos(newArray)
  }
 
  return (
    <div>

      <Box sx={{ height: '85vh', width: '100%' }}>
      <MuiFileInput multiple fullWidth value={imgFiles} onChange={handleChange} inputProps={{ accept: 'image/*' }}/>
        <Box sx={{height: '40%', 
                  display: 'block',
                  // p: 1,
                  // mx: 1,
                  overflow: 'auto'
                }}>
          <List dense={true}>
            { imgFileInfos.length > 0? <DSList photos_ = {imgFileInfos}/>:null}
          </List>      
        </Box>
        <Box sx={{height: '30%'}}
        display="flex"
                alignItems="center"
                justifyContent="center"
                >
          {imgFileInfos.length > 0 && selectedIndex >=0?
            <img src={"https://naveropenapi.apigw.ntruss.com/map-static/v2/raster-cors?w=200&h=200"+
            "&markers=type:d|size:tiny|pos:"+Number(imgFileInfos[selectedIndex].gps.longitude)+"%20"+  + Number(imgFileInfos[selectedIndex].gps.latitude) +
            "&center="+Number(imgFileInfos[selectedIndex].gps.longitude) +"," + Number(imgFileInfos[selectedIndex].gps.latitude) +
            "&level=14" +"&scale=2&X-NCP-APIGW-API-KEY-ID=f4plizrvxg"}
            style={{ width: "200px", height: "200px" }}></img>
          :
          null
          }
        </Box>
        <Box sx={{height: '30%'}}>
          {imgFileInfos.length > 0 && selectedIndex >=0?
            <DSPhotoHSTEdit photoInfo = {imgFileInfos[selectedIndex]} update = {updatenewInfo}/>  
            :
            null
          } 
        </Box>
      </Box>
      <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={2}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
        <Button variant="outlined"  disabled = {selected_mode === "MAPGEOJSONEDIT"}
          onClick={() => {console.log(checked)}}> Save</Button>
        <Button variant="outlined"  onClick={() => {}}> Cancel/Back</Button>
      </ButtonGroup>

    </div>
  );
}


