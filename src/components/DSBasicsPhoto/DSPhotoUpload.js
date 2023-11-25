import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';
import { Amplify, Auth , Storage } from 'aws-amplify';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, List, 
  Typography, Button,ButtonGroup, Stack, IconButton, Box, Checkbox} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import useWatchLocation from '../DSBasics/useWatchLocation.js'
import DSPhotoHSTEdit from "./DSPhotoHSTEdit"
import { useObjectUrls } from '../DSBasics/useObjectUrls';

import { BaseContext, MapQContext, MapCRSQContext} from "../../context"
import { MuiFileInput } from 'mui-file-input'
import exifr from 'exifr'
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, bbox as turfbbox ,centroid as turfcentroid} from "@turf/turf";
import loadImage from 'blueimp-load-image';
import ExifReader from 'exifreader';

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

  const [capImgFile, setCapImgFile] = React.useState(null);
  
  
  const geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 1000 * 60 * 1, // 1 min (1000 ms * 60 sec * 1 minute = 60 000ms)
    maximumAge: 5000 // 24 hour
  }
  
  const { location, cancelLocationWatch, error ,accuracy} = useWatchLocation(geolocationOptions);

  const inputRef = React.useRef();

  useEffect(() => {

    console.log("GPS",location)
    return () => {cancelLocationWatch();}
  },[location]);

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
                {/* <Typography variant="subtitle1" style={{ fontWeight: 'bold' , color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {(index + 1)+"."+ photo_.info.Course +'[' + photo_.info.Hole+']'}
                </Typography> */}
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' , color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {(index + 1)+"."+ photo_.date +'[' + JSON.stringify(photo_.info)+']'}
                </Typography>
                <Typography variant="caption" style={{ color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {photo_.gps.longitude === 'TBD' || photo_.gps.latitude === 'TBD'? 'No GPS info':(photo_.gps.longitude.toFixed(5) + ',' + photo_.gps.latitude.toFixed(5))}
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

  const handleChangeinput = (newValue) => {
    console.log(inputRef.current.files)
    setCapImgFile(Object.values(inputRef.current.files)[0]);
  }

  useEffect(() => {

    if( capImgFile === null) return

    const getFileInfoGPS = async(file_) =>{

      let date_ = null;
      let altitude_ = null;
      let thumb_ = null;

      let tags = await ExifReader.load(file_)
      let exifs = await exifr.parse(file_)
      let thumbfromExifr = await exifr.thumbnailUrl(file_)
      let gpsfromExifr = await exifr.gps(file_) 

      // console.log(tags, exifs)
      if(typeof exifs !== 'undefined') {
        if ('DateTimeOriginal' in exifs) date_ = exifs.DateTimeOriginal.toISOString().slice(0,19).replace('T',' ')
      }
      
      if(date_ === null) date_ = file_.lastModifiedDate.toISOString().slice(0,19).replace('T',' ')


      // if('Thumbnail' in tags) thumb_ = 'data:image/jpg;base64,' + tags['Thumbnail'].base64;
      // else 
      thumb_ = thumbfromExifr

      if(typeof thumb_ === 'undefined' || thumb_=== null) thumb_ = await GenerateThumbUrl(file_)



      let gps_ = {longitude:'TBD', latitude: 'TBD', altitude:0}


      if(typeof gpsfromExifr !=='undefined') {
        gps_.longitude = gpsfromExifr.longitude
        gps_.latitude = gpsfromExifr.latitude
      }

      if(gps_.longitude === 'TBD' || gps_.latitude ==='TBD') {
        gps_.longitude = location[0]
        gps_.latitude = location[1]

      }


      
      
      return {thumbUrl: thumb_, gps : gps_, date:date_.replace(/[^a-zA-Z0-9 ]/g, ""), by:loginuser}
      // return {thumbUrl: thumb_, gps : gps_, altitude:altitude_, date:date_ }
    }



    getFileInfoGPS(capImgFile).then((res)=>{
      console.log(res); 
      saveCaptuedImgtoS3(res, capImgFile)
    })

    
    

    // getAllInfos(imgFiles).then((results_) => {setImgFileInfos(results_); console.log(results_)}).catch((err)=> alert(err))

  },[capImgFile]);

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

function resize(base64){
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = function(){

      var width = 160; 
      var height = 120; 

      var canvas = document.createElement('canvas');  // Dynamically Create a Canvas Element
      canvas.width  = width;  // Set the width of the Canvas
      canvas.height = height;  // Set the height of the Canvas
      var ctx = canvas.getContext("2d");  // Get the "context" of the canvas 
      ctx.drawImage(img,0,0,width,height);  // Draw your image to the canvas
      
      console.log("thum", canvas.toDataURL("image/jpeg"))
      return resolve(canvas.toDataURL("image/jpeg")  )
    }
    img.onerror = reject
    img.src = base64
  })
}

  async function GenerateThumbUrl(file_){

    let imgBase64 =  await toBase64(file_);
    let thumnailURL_ = await resize(imgBase64);

    return thumnailURL_    
    

  }

  async function saveCaptuedImgtoS3(info_, file_){
    try {
      await Storage.put(loginuser+'/rgb/'+ info_.date+file_.name.replace(/\.[^/.]+$/, "")+'.jpg', file_)

      if(info_.thumbUrl !== null){
        
        let imgtemp = await fetch(info_.thumbUrl).then(r => r.blob()).then(blobFile => new File([blobFile], "fileNameGoesHere", { type: "image/jpeg" }))
        await Storage.put(loginuser+'/thumb/'+ info_.date+file_.name.replace(/\.[^/.]+$/, "")+'.jpg', imgtemp)

      }

    } catch (error) {
      console.log("Error uploading file: ", error);
    }

  }

  const dataURItoBlob = (dataURI)=> {
    let byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([ab], {type: mimeString});
    return blob;
  }

  // async function Upload (filename) {
  //   try {
  //     await Storage.put(selected_course+'/'+ filename, dataURItoBlob(imgSrc), {
  //       level: "public",
  //       contentType: "image/png", // contentType is optional
  //       // customPrefix: {public: selected_course + "/"}
  //     });
  //   } catch (error) {
  //     console.log("Error uploading file: ", error);
  //   }
  // } 

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
      {/* <MuiFileInput multiple fullWidth value={imgFiles} onChange={handleChange} /> */}
      {/* <input multiple="multiple" type="file" name="files[]" onChange={handleChangeinput} /> */}
      {/* <input ref={inputRef} type="file" name="files-upload" onChange={handleChangeinput} multiple />; */}
      <Button variant="contained" component="label" startIcon={<CameraAltIcon />}>
        Camera
        <input ref={inputRef} type="file" hidden name="file" accept="image/*"  capture="camera" onChange={handleChangeinput} />
      </Button>

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
          onClick={() => {console.log(checked);saveAllfiles()}}> Save</Button>
        <Button variant="outlined"  onClick={() => {}}> Cancel/Back</Button>
      </ButtonGroup>

    </div>
  );
}


