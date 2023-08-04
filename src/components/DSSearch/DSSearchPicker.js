import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography, Box} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, SInfoContext} from "../../context"

export default function DSSearchPicker() {

  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord} = useContext(SInfoContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo,selected_course_info, setSelectedCourseInfo} = useContext(BaseContext);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  
  const DSList = ({ courses_ }) => {

    const list = courses_.map((course_, index) => 

      <ListItem key = {course_.id} divider={true}>
        <ListItemButton selected={selectedIndex === index} onClick={
          () => {
          setSelectedInfo(course_);          
          setSelectedIndex(index);
          }
        }    
            sx={{
              "&.Mui-selected": {
                backgroundColor: "#035efc"
              },
              "&.Mui-focusVisible": {
                backgroundColor: "#035efc"
              },
              ":hover": {
                backgroundColor: "0077b6"
              }
            }}
        >

          <ListItemText
            disableTypography
            primary={<Typography variant="body2" style={{ fontWeight: 'bold' ,color: selectedIndex === index? '#ffffff':'#000000'}}> {index+1 + ". "+ course_.place_name}</Typography>}
            secondary={<Typography variant="caption" style={{ color: selectedIndex === index? '#ffffff':'#000000'}}> {course_.address_name}</Typography>}
          />
        </ListItemButton>
      </ListItem>
    )

    return list
  }

  useEffect(() => {

  },[]);
 
  return (
    <Box sx={{ p: 1, border: '1px solid gray',gap: 1, borderRadius: 0 , flexDirection: 'column', overflow:"auto"}}>
      <List dense={true}>
        <DSList courses_ = {searchinfo}/>
      </List>
    </Box>
  );
}