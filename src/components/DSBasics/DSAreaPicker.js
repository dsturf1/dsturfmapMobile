import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography, FormGroup, Stack} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, MapQContext, MapCRSQContext} from "../../context"

export default function DSAreaPicker({geojson_mode}) {


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo,selected_polygon, setPolyGon} = useContext(BaseContext);
  const {CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, tpoly, setTPoly,  
    holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const DSList = ({ polys_ }) => {

    const list = polys_.sort((a,b) => a.TypeId - b.TypeId).map((poly_, index) => 

      <ListItem key = {poly_.properties.Id} divider={true}>
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
          primary={
            <Stack direction="row" justifyContent="space-between"  alignItems="center" >
              <Typography variant="body2" style={{ fontWeight: 'bold' ,color: selectedIndex === index? '#ffffff':'#000000'}} > 
              {"["+(index + 1)+"]"+ poly_.properties.Type+ ' ' + poly_.properties.Course +'['+poly_.properties.Hole+']'}</Typography>
            </Stack>
          }
        />
        </ListItemButton>
      </ListItem>
    )

    return list
  }

  useEffect(() => {

    console.log(tpoly)

  },[tpoly]);
 
  return (
    <Paper style={{height: '100%', overflow: 'auto'}}>
      <List dense={true}>
        { tpoly.length > 0? <DSList polys_ = {tpoly}/>:null}
      </List>
    </Paper>
  );
}