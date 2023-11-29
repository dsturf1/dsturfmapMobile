import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';
import { Amplify, Auth , Storage } from 'aws-amplify';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, List, 
  Typography, Button,ButtonGroup, Stack, IconButton, Box, Checkbox} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import useWatchLocation from '../DSBasics/useWatchLocation.js'
import DSPhotoHSTEdit from "./DSPhotoHSTEdit.js"
import { useObjectUrls } from '../DSBasics/useObjectUrls.js';

import Inline from "yet-another-react-lightbox/plugins/inline";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import { BaseContext, MapQContext, MapCRSQContext, PhotoContext} from "../../context/index.js"
import { MuiFileInput } from 'mui-file-input'
import exifr from 'exifr'
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, bbox as turfbbox ,centroid as turfcentroid} from "@turf/turf";
import { label_single} from '../../constant/labelconstants.js';
import loadImage from 'blueimp-load-image';
import ExifReader from 'exifreader';
import './Input4IOS.css';

export default function DSPhotoView() {


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
  

  useEffect(() => {
    setMode("DSphotoView")
    
  },[]);

  useEffect(() => {
    console.log(ds_imgURLs)
    
  },[ds_imgURLs]);



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
          key={'DSphotoView' + index}
          secondaryAction={
            <Checkbox
              edge="end"
              onChange={handleToggle(index)}
              checked={checked.indexOf(index) !== -1}
              inputProps={{ 'aria-labelledby': 'DSphotoView' + index }}
              // defaultChecked={true}
            />
          }
          disablePadding
        >
          <ListItemButton
            selected={selectedIndex === index}
            onClick={() => {          
              setSelectedIndex(index);
              setSPhotoJson({...ds_photojson[index]})
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
            <ListItemText id={'DSphotoViewText' + index} primary={
              // <Stack direction="column" justifyContent="space-between"  alignItems="center" >
              <Stack direction="column" justifyContent="space-between" >
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' , color: selectedIndex === index? '#ffffff':'#000000'}} > 
                  {(index + 1)+"."+ photo_.date.slice(0, 8) +'[' + JSON.stringify(photo_.type)+']'}
                </Typography>
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

  
  


  return (
    <div>

      <Box sx={{ height: '85vh', width: '100%' }}>
        {selected_photojson === null?
        <Box sx={{height: '80vh', 
                  display: 'block',
                  overflow: 'auto'
                }}>
          <List dense={true}>
            { ds_imgURLs.length > 0? <DSList photos_ = {ds_imgURLs}/>:null}
          </List>      
        </Box>
        :
        <Stack direction="column" spacing={2}>
          <Box component="div" sx={{height: '20vh', 
          overflow: 'auto'
        }}>
            <List dense={true}>
              { ds_imgURLs.length > 0? <DSList photos_ = {ds_imgURLs}/>:null}
            </List>  
          </Box>
          <Box component="div" sx={{height: '40vh'  }}>
           {/* <Lightbox
             index={selectedIndex}
             open={selected_photojson !== null}
            //  plugins={[Inline]}
             inline={{ style: { width: "100%", height:"100%" } }}
             slides={[...ds_imgURLs.map((x)=> {return {src:x.thumb}})]}
             on={{
               view: ({ index }) => {
                 // imgURLs.length>0 && index>=0? setCaption('['+index+'/'+ imgURLs.length+']'+imgURLs[index].desc):setCaption("");
                 setSelectedIndex(index)
                 // setMultiIndex([index]);
               }
               // view?: ({ index }: { index: number }) 
             }}>              
          </Lightbox> */}
            <img src={ds_imgURLs.filter((x)=> x.id === selected_photojson.id)[0].thumb}
            style={{ width: "100%", height: "100%" }}></img>
          </Box>
          <Box component="div" sx={{height: '30vh'  }}>
          {ds_photojson.length > 0 && selectedIndex >=0?
            // <DSPhotoHSTEdit photoInfo = {pr_photojson[selectedIndex]} update = {updatenewInfo}/>
            <DSPhotoHSTEdit/>  
            :
            null
          } 
          </Box>
          </Stack>
          // {/* <Lightbox
          //   index={selectedIndex}
          //   open={selected_photojson !== null}
          //   plugins={[Inline, Zoom]}
          //   inline={{ style: { width: "100%", height:"100%" } }}
          //   slides={[...ds_imgURLs.map((x)=> {return {src:x.rgb}})]}
          //   on={{
          //     view: ({ index }) => {
          //       // imgURLs.length>0 && index>=0? setCaption('['+index+'/'+ imgURLs.length+']'+imgURLs[index].desc):setCaption("");
          //       setSelectedIndex(index)
          //       // setMultiIndex([index]);
          //     }
          //     // view?: ({ index }: { index: number }) 
          //   }}>              
          // </Lightbox> */}
          // {/* </Stack> */}
          
        }
      </Box>
      <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={2}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
        <Button variant="outlined"  disabled = {checked.length===0}
          onClick={() => {}}> Save</Button>
        <Button variant="outlined"  onClick={() => {setSPhotoJson(null)}}> Cancel/Back</Button>
      </ButtonGroup>

    </div>
  );
}


