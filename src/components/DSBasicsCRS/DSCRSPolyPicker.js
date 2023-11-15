import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography, FormGroup, Stack, IconButton} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';

import { BaseContext, MapQContext, MapCRSQContext} from "../../context"

export default function DSAreaPicker({geojson_mode}) {


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo,selected_polygon, setPolyGon} = useContext(BaseContext);
  const {CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, CRStpoly, setCRSTPoly,  
    holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [allList, setList] = React.useState([]);

  const DSList = ({ polys_ }) => {

    const list = polys_.sort((a,b) => a.TypeId - b.TypeId).map((poly_, index) => 

      <ListItem 
        key = {poly_.properties.Id} 
        divider={true}
        secondaryAction={
          <IconButton edge="end" aria-label="delete" disabled={selectedIndex !== index}
          onClick={() => {
          }}>
            <DeleteIcon fontSize= 'small'/>
          </IconButton>
        }
        >
        <ListItemButton selected={selectedIndex === index} onClick={() => {
          setPolyGon({...poly_})
          setSelectedIndex(index);
        }}    
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#035efc"
            },
            "&.Mui-focusVisible": {
              backgroundColor: "#035efc"
            },
            ":hover": {
              backgroundColor: "#f0f4fa"
            }
          }}
        >
        <ListItemText
          disableTypography
          // primaryTypographyProps={{fontSize: '8px'}} 
          primary={
            <Stack direction="column" justifyContent="space-between"  alignItems="center" >
              <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: selectedIndex === index? '#ffffff':'#000000'}} > 
              {(index + 1)+"."+ poly_.properties.Course +'['+poly_.properties.Hole+']' +(geojson_mode === 'AREA'? '': poly_.properties.LabelL1)}</Typography>
              {/* {geojson_mode === 'AREA'? null: 
              <Typography variant="subtitle1" style={{ color: selectedIndex === index? '#ffffff':'#000000'}} > 
              { poly_.properties.LabelL1+ ' '+'['+poly_.properties.LabelL2+']'}</Typography>
              } */}
            </Stack>
          }
        />
        </ListItemButton>
      </ListItem>
    )
    // setList(list)
    return list
  }

  // useEffect(() => {

  //   console.log(CRStpoly)
  // },[CRStpoly]);

  useEffect(() => {

  if (selected_polygon === null) {setSelectedIndex(-1) ;return}
  CRStpoly.forEach(function (poly_, i) {
    if (poly_.properties.Id === selected_polygon.properties.Id) setSelectedIndex(i)
  })
    
  }, [selected_polygon])

 
  return (
    <Paper style={{height: '100%', overflow: 'auto'}}>
      <List dense={true}>
        {CRStpoly.length > 0? <DSList polys_ = {CRStpoly}/>:null}
      </List>
    </Paper>
  );
}