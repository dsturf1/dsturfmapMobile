import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';
import { Amplify, Auth , Storage } from 'aws-amplify';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, List, 
  Typography, Button,ButtonGroup, Stack, IconButton, Box, Checkbox} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';
import DSPhotoHSTEdit from "./DSPhotoHSTEdit"
import { useObjectUrls } from '../DSBasics/useObjectUrls';

import { BaseContext, MapQContext, MapCRSQContext} from "../../context"
import { MuiFileInput } from 'mui-file-input'
import exifr from 'exifr'
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, bbox as turfbbox ,centroid as turfcentroid} from "@turf/turf";
import loadImage from 'blueimp-load-image';
import ExifReader from 'exifreader';

export default function DSPhotoUploadSingle() {


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo,selected_polygon, setPolyGon} = useContext(BaseContext);
  const {CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, CRStpoly, setCRSTPoly,  
    holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);    
  const {geojsoninfo, setGeoJsonInfo,tpoly, setTPoly,targetpolygons, setTargetPolygons, 
    targetpoints, setTargetPoints, isLoading, setIsLoading} = useContext(MapQContext);

  const [imgFiles, setImgFiles] = React.useState([])
  const [imgFileInfos, setImgFileInfos] = React.useState([])
  const getObjectUrl = useObjectUrls()

  const inputRef = React.useRef();

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

  const handleChangeinput = (newValue) => {
    setImgFiles(Object.values(inputRef.current.files));
    setSelectedIndex(-1);
    console.log(inputRef.current.files)
  }

  useEffect(() => {
    console.log('Files',imgFiles)



    const getFileInfoGPS = async(file_) =>{

      let date_ = null;
      let altitude_ = null;
      let thumb_ = null;

      let tags = await ExifReader.load(file_)
      let exifs = await exifr.parse(file_)
      let thumbfromExifr = await exifr.thumbnailUrl(file_)
      let gpsfromExifr = await exifr.gps(file_) 

      console.log(tags, exifs)

      if('DateTimeOriginal' in tags) date_= tags['DateTimeOriginal'].description
      else if ('DateTimeOriginal' in exifs) date_ = exifs.DateTimeOriginal.toISOString().slice(0,19).replace('T',' ')
      else date_ = file_.lastModifiedDate.toISOString().slice(0,19).replace('T',' ')


      if('Thumbnail' in tags) thumb_ = 'data:image/jpg;base64,' + tags['Thumbnail'].base64;
      else thumb_ = thumbfromExifr

      let gps_ = {longitude:'TBD', latitude: 'TBD'}

      if('GPSLatitude' in tags) gps_.latitude = tags['GPSLatitude'].description
      else if(gpsfromExifr.latitude !== null || typeof gpsfromExifr.latitude !=='undefined') gps_.latitude = gpsfromExifr.latitude
      if('GPSLongitude' in tags) gps_.longitude = tags['GPSLongitude'].description
      else if(gpsfromExifr.longitude !== null || typeof gpsfromExifr.longitude !=='undefined')gps_.longitude = gpsfromExifr.longitude
      
      
      return {thumbUrl: thumb_, gps : gps_, date:date_ , by:loginuser}
      // return {thumbUrl: thumb_, gps : gps_, altitude:altitude_, date:date_ }
    }

    const getAllInfos = async(files_) =>{
      return await Promise.all(files_.map((x)=> getFileInfoGPS(x)))
    }

    getAllInfos(imgFiles).then((results_) => {setImgFileInfos(results_); console.log(results_)}).catch((err)=> alert(err))

    setChecked([...Array(imgFiles.length).keys()]);

    

  },[imgFiles]);

  const updatenewInfo = (val) =>{
    const newArray = [...imgFileInfos]
    newArray[selectedIndex] = val
    setImgFileInfos(newArray)
  }
 
  async function saveFile_to_S3(file_){
    try {
      await Storage.put('rgb/'+uuidv4()+'.jpg', file_)
    } catch (error) {
      console.log("Error uploading file: ", error);
    }

  }

  const saveAllfiles = async() =>{
    return await Promise.all(imgFiles.map((x)=> saveFile_to_S3(x)))
  }
  return (
    <div>

      <Box sx={{ height: '85vh', width: '100%' }}>
      <MuiFileInput multiple fullWidth value={imgFiles} onChange={handleChange} />
      {/* <input multiple="multiple" type="file" name="files[]" onChange={handleChangeinput} /> */}
      <input ref={inputRef} type="file" name="files-upload" onChange={handleChangeinput} multiple />;
      <input type="file" name="file" accept="image/*" capture="camera" onChange={handleChangeinput} />
        <Box sx={{height: '40%', 
                  display: 'block',
                  // p: 1,
                  // mx: 1,
                  overflow: 'auto'
                }}>
   
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
          onClick={() => {console.log(checked);saveAllfiles()}}> Save</Button>
        <Button variant="outlined"  onClick={() => {}}> Cancel/Back</Button>
      </ButtonGroup>

    </div>
  );
}


