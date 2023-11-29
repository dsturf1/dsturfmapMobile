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

import { BaseContext, MapQContext, MapCRSQContext, PhotoContext} from "../../context"
import { MuiFileInput } from 'mui-file-input'
import exifr from 'exifr'
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, bbox as turfbbox ,centroid as turfcentroid} from "@turf/turf";
import { label_single} from '../../constant/labelconstants';
import loadImage from 'blueimp-load-image';
import ExifReader from 'exifreader';
import './Input4IOS.css';

export default function DSPhotoUpload({geojson_mode}) {


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo,selected_polygon, setPolyGon, selected_course_info, setSelectedCourseInfo} = useContext(BaseContext);
  const {pr_photojson, setPrPhotoJson, ds_photojson, setDSPhotoJson, selected_photojson, setSPhotoJson, 
    pr_imgURLs, setPrImgURLs, ds_imgURLs, setDSImgURLs,  photo_loading, setPhotoLoading}  = useContext(PhotoContext);

  const {CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, CRStpoly, setCRSTPoly,  
    holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);    
  const {geojsoninfo, setGeoJsonInfo,tpoly, setTPoly,targetpolygons, setTargetPolygons, 
    targetpoints, setTargetPoints, isLoading, setIsLoading} = useContext(MapQContext);


  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [checked, setChecked] = React.useState([]);

  const [capImgFile, setCapImgFile] = React.useState(null);

  
  
  const geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 1000 * 60 * 1, // 1 min (1000 ms * 60 sec * 1 minute = 60 000ms)
    maximumAge: 5000 // 24 hour
  }
  const label_ini = JSON.parse(JSON.stringify(label_single));
  const { location, cancelLocationWatch, error ,accuracy} = useWatchLocation(geolocationOptions);

  const inputRef = React.useRef();

  useEffect(() => {


    console.log("GPS",location)
    return () => {cancelLocationWatch();}
  },[location]);

  useEffect(() => {

    setMode("DSphotoUpload")


  },[]);



  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    console.log(newChecked)

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
              setSPhotoJson({...pr_photojson[index]})
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
                src={photo_.thumb}
              />
            </ListItemAvatar>
            <ListItemText id={'DSphotoUploadText' + index} primary={
              // <Stack direction="column" justifyContent="space-between"  alignItems="center" >
              <Stack direction="column" justifyContent="space-between" >
                {/* <Typography variant="subtitle1" style={{ fontWeight: 'bold' , color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {(index + 1)+"."+ photo_.info.Course +'[' + photo_.info.Hole+']'}
                </Typography> */}
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' , color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {(index + 1)+"."+ photo_.date.slice(0, 8) +'[' + JSON.stringify(photo_.type)+']'}
                </Typography>
                {/* <Typography variant="caption" style={{ color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {photo_.gps.longitude === 'TBD' || photo_.gps.latitude === 'TBD'? 'No GPS info':(photo_.gps.longitude.toFixed(5) + ',' + photo_.gps.latitude.toFixed(5))}
                </Typography> */}
                <Typography variant="caption" style={{ color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {photo_.gps.longitude === 'TBD' || photo_.gps.latitude === 'TBD'? 'No GPS info':
                    (photo_.hasOwnProperty('location') && typeof photo_.location !== 'undefined'? (photo_.location.Course + ',' + photo_.location.Hole)
                    :(photo_.gps.longitude.toFixed(5) + ',' + photo_.gps.latitude.toFixed(5))
                    )}
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

  return {Client:selected_course_info.name, Course:course_, Hole:hole_}
}



  const handleChangeinput = (newValue) => {
    console.log(inputRef.current.files)
    // alert(Object.values(inputRef.current.files)[0].name)
    setCapImgFile(Object.values(inputRef.current.files)[0]);
  }

  useEffect(() => {



    if( capImgFile === null) return
    alert(capImgFile.name)
    const getFileInfoGPS = async(file_) =>{

      let date_ = null;
      let thumb_ = null;

      let exifs = await exifr.parse(file_)
      let thumbfromExifr = await exifr.thumbnailUrl(file_)
      let gpsfromExifr = await exifr.gps(file_) 
      
      if(typeof exifs !== 'undefined') {
        if ('DateTimeOriginal' in exifs) date_ = exifs.DateTimeOriginal.toISOString().slice(0,19).replace('T',' ')
      }      
      if(date_ === null) {
        if (file_.hasOwnProperty('lastModifiedDate'))
          date_ = file_.lastModifiedDate.toISOString().slice(0,19).replace('T',' ')
        else {
          let datT = new Date();
          date_ = datT.toISOString().slice(0,19).replace('T',' ')
        }
      }

      thumb_ = thumbfromExifr
      if(typeof thumb_ === 'undefined' || thumb_=== null) thumb_ = await GenerateThumbUrl(file_)



      let gps_ = {longitude:'TBD', latitude: 'TBD', altitude:'TBD'}
      if(typeof gpsfromExifr !=='undefined') {
        gps_.longitude = gpsfromExifr.longitude
        gps_.latitude = gpsfromExifr.latitude
      }
      if(gps_.longitude === 'TBD' || gps_.latitude ==='TBD') {
        gps_.longitude = (location[0] === null? 0:location[0])
        gps_.latitude = (location[1] === null? 0:location[1])
      }

      if(typeof exifs !== 'undefined') {
        if ('GPSAltitude' in exifs) gps_.altitude = exifs.GPSAltitude
      }

      let location_info = {
        Client:selected_course_info.name,
        Course:"?",
        Hole:0,
      }

      if(gps_.altitude === 'TBD') {
        gps_.altitude = (location[2] === null? 0:location[2])        
      }
      else{
        let pt = turfpoint([gps_.longitude, gps_.latitude])
        location_info = check_CRSandHole(pt)
      }

      console.log(location_info)
      
      return {thumbUrl: thumb_, gps : gps_, date:date_.replace(/[^a-zA-Z0-9 ]/g, ""), by:loginuser, location: location_info}
    }



    getFileInfoGPS(capImgFile).then((res)=>{
      console.log(res); 
      // alert(res.gps.longitude)
      saveCaptuedImgtoS3(res, capImgFile)
    }).catch((error) => {
      console.log(error);
      alert(error)
    });

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

      var width = 480; 
      var height = 360; 

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

      let idS3 = info_.date.replace(" ","") + info_.gps.longitude.toFixed(10).replace(".","") 
            + info_.gps.latitude.toFixed(10).replace(".","")+ info_.gps.altitude.toFixed(10).replace(".","")
      let filenameS3 = idS3 +'.jpg'

      let fileObj = {
        id: idS3,
        name:filenameS3,
        imgsrc:loginuser+'/rgb/'+ filenameS3,
        thumbsrc:loginuser+'/thumb/'+ filenameS3,
        ndvisrc:loginuser+'/ndvi'+ filenameS3,
        gps:{...info_.gps},
        date:info_.date,
        info:{
          type:"TBD",// TBD, 잔디 현황, 작업 사진, 방제 일보, 계측기 결과, NDVI, Thermal
          typeId:0,
          label:label_ini,
          desc:"",
          value:0.0,
          ndvi_avg:0.0,
          temp_avg:0.0
        },
        location:info_.location,
        by:info_.by
      }
      

      await Storage.put(fileObj.imgsrc, file_)

      if(info_.thumbUrl !== null){
        
        let imgtemp = await fetch(info_.thumbUrl).then(r => r.blob()).then(blobFile => new File([blobFile], "fileNameGoesHere", { type: "image/jpeg" }))
        await Storage.put(fileObj.thumbsrc, imgtemp)

      }

      let datajson_ = [...pr_photojson.filter((x)=> x.id !== fileObj.id),{...fileObj}].sort((a, b) => a.id.localeCompare(b.id))

      await Storage.put(loginuser+'/photo.json', JSON.stringify(datajson_))
      let newUrl_ = await getImgUrl(fileObj)
      let newUrls_ = [...pr_imgURLs.filter((x)=> x.id !== fileObj.id), {...newUrl_}].sort((a, b) => a.id.localeCompare(b.id))
      console.log('New DB', datajson_,newUrls_)
      setPrPhotoJson([ ...datajson_])
      setPrImgURLs([ ...newUrls_])


    } catch (error) {
      console.log("Error uploading file: ", error);
      alert(error);
    }

  }

  async function Upload2DB(){
    let selected_photos_ = pr_photojson.filter((x,i) => checked.includes(i))
    let selected_Urls_ = pr_imgURLs.filter((x,i) => checked.includes(i))
    let remained_photos_ = pr_photojson.filter((x,i) => !checked.includes(i))
    let remained_Urls = pr_imgURLs.filter((x,i) => !checked.includes(i))

    try {
      let requests = selected_photos_.map((obj_) => 
      {
        return Storage.copy({ key: obj_.imgsrc}, { key: obj_.imgsrc.replace(loginuser,selected_course)})
      })
      let responses = await Promise.all(requests);
      console.log(responses)

      requests = selected_photos_.map((obj_) => 
      {
        return Storage.copy({ key: obj_.thumbsrc}, { key: obj_.thumbsrc.replace(loginuser,selected_course)})
      })
      responses = await Promise.all(requests);
      console.log(responses)

      requests = selected_photos_.map((obj_) => 
      {
        console.log(obj_.imgsrc)
        return Storage.remove({ key:'public/'+ obj_.imgsrc}, { level: "public", contentType: "image/jpeg", });
      })
      responses = await Promise.all(requests);
      console.log(responses)

      requests = selected_photos_.map((obj_) => 
      {
        console.log(obj_.thumbsrc)
        return Storage.remove({ key: obj_.thumbsrc});
      })
      responses = await Promise.all(requests);
      console.log(responses)

      await Storage.put(loginuser+'/photo.json', JSON.stringify(remained_photos_))
      setPrPhotoJson([ ...remained_photos_])
      setPrImgURLs([ ...remained_Urls])
      setSelectedIndex(-1)

      let DSBD_photojson = [...ds_photojson,... selected_photos_]
      let DSBD_photoUrl = [...ds_imgURLs, ...selected_Urls_]

      console.log(DSBD_photojson)

      await Storage.put(selected_course +'/photo.json', JSON.stringify(DSBD_photojson))
      setDSPhotoJson([...DSBD_photojson])
      setDSImgURLs([ ...DSBD_photoUrl])

    }

    catch (errors) {
      // errors.forEach((error) => console.error(error));
      console.log(errors)
      alert('Loading이 안되네요! 다른 폴더 먼저 해보세요!!')
    }

  }

  async function getImgUrl(x) {
      return {
        id:x.id,
        desc:x.type,
        type:x.type,
        date:x.date,
        gps:x.gps,
        location:x.location,
        width:800,
        height:600,
        alt: '[]'+x.type,
        src:await Storage.get(x.imgsrc, {
          // validateObjectExistence: true 
          expires:3600
        }), 
        rgb:await Storage.get(x.imgsrc, {
          // validateObjectExistence: true 
          expires:3600
        }), 
        thumb:await Storage.get(x.thumbsrc, {
          // validateObjectExistence: true 
          expires:3600
        }),  
        ndvi:await Storage.get(x.ndvisrc, {
          // validateObjectExistence: true 
          expires:3600
        }), 
      }
    }


  return (
    <div>

      <Box sx={{ height: '85vh', width: '100%' }}>
      {/* <MuiFileInput multiple fullWidth value={imgFiles} onChange={handleChange} /> */}
      <div>
        <Button variant="contained" component="label" startIcon={<CameraAltIcon /> } onClick = {() => inputRef.current.click()}>
          Camera
        </Button>
        <input ref={inputRef} id="inputpic" type="file" name="file" accept="image/jpeg"  capture="camera" onChange={handleChangeinput} />
      </div>

        <Box sx={{height: '40%', 
                  display: 'block',
                  // p: 1,
                  // mx: 1,
                  overflow: 'auto'
                }}>
          <List dense={true}>
            { pr_imgURLs.length > 0? <DSList photos_ = {pr_imgURLs}/>:null}
          </List>      
        </Box>
        <Box sx={{height: '30%'}}
        display="flex"
                alignItems="center"
                justifyContent="center"
                >
          {pr_photojson.length > 0 && selectedIndex >=0?
            <img src={"https://naveropenapi.apigw.ntruss.com/map-static/v2/raster-cors?w=200&h=200"+
            "&markers=type:d|size:tiny|pos:"+Number(selected_photojson.gps.longitude)+"%20"+  + Number(selected_photojson.gps.latitude) +
            "&center="+Number(selected_photojson.gps.longitude) +"," + Number(selected_photojson.gps.latitude) +
            "&level=14" +"&scale=2&X-NCP-APIGW-API-KEY-ID=f4plizrvxg"}
            style={{ width: "200px", height: "200px" }}></img>
          :
          null
          }
        </Box>
        <Box sx={{height: '30%'}}>
          {pr_photojson.length > 0 && selectedIndex >=0?
            // <DSPhotoHSTEdit photoInfo = {pr_photojson[selectedIndex]} update = {updatenewInfo}/>
            <DSPhotoHSTEdit/>  
            :
            null
          } 
        </Box>
      </Box>
      <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={2}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
        <Button variant="outlined"  disabled = {checked.length===0}
          onClick={() => {Upload2DB(); }}> Upload</Button>
        <Button variant="outlined"  onClick={() => {}}> Cancel/Back</Button>
      </ButtonGroup>

    </div>
  );
}


