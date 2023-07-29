import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography, FormGroup, Stack} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, SInfoContext, MapQContext} from "../../context"

export default function DSCoursePicker() {

  const {mapinfo, setMapInfo, isLoading, setIsLoading} = useContext(MapQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId} = useContext(BaseContext);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const DSList = ({ courses_ }) => {

    const list = courses_.map((course_, index) => 

      <ListItem key = {course_.id} divider={true}>
        <ListItemButton selected={selectedIndex === index} onClick={() => {setCourse(course_); setSelectedIndex(index);}}    
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
              <Typography variant="body2" style={{ fontWeight: 'bold' ,color: selectedIndex === index? '#ffffff':'#000000'}} > {"["+(course_.numHole?course_.numHole:0)+"]"+ course_.name}</Typography>
              <Typography variant="caption" style={{color: selectedIndex === index? '#ffffff':'#000000'}}> {course_.center[0].toFixed(2)}, {course_.center[1].toFixed(2)}</Typography>
            </Stack>
          }
        />
        </ListItemButton>
      </ListItem>
    )

    return list
  }

  useEffect(() => {

  },[]);
 
  return (
    <Paper style={{height: '100%', overflow: 'auto'}}>
      <List dense={true}>
        { Object.keys(baseinfo).length >0 && baseinfo.course_info.length === 0? null: <DSList courses_ = {baseinfo.course_info}/>}
      </List>
    </Paper>
  );
}