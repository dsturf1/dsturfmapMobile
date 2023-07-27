import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography } from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { SInfoContext} from "../../context/DSSearchData.js"

export default function DSNaverPicker() {

  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord} = useContext(SInfoContext);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const DSList = ({ courses_ }) => {

    const list = courses_.map((course_, index) => 

      <ListItem key = {course_.id} divider={true}>
        <ListItemButton selected={selectedIndex === index} onClick={() => {setSelectedInfo(course_); setSelectedIndex(index);}}    
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
          {/* <ListItemAvatar >
            <Avatar sx={{ bgcolor: indigo[700]}}>
              <GolfCourseIcon style={{ color: indigo[100] }} fontSize='small'/>
            </Avatar>
          </ListItemAvatar> */}
          {/* <ListItemText
            disableTypography
            primary={<Typography variant="h6" style={{ fontWeight: 'bold' }}> {index +1 }</Typography>}
          /> */}
          {/* <Typography variant="h6" style={{ fontWeight: 'bold' }}> {index +1 }</Typography> */}
          <ListItemText
            disableTypography
            primary={<Typography variant="body2" style={{ fontWeight: 'bold' ,color: selectedIndex === index? '#ffffff':'#000000'}}> {index+1 + ". "+ course_.place_name}</Typography>}
            // primary= {course_.place_name} sx={{fontWeight: 'bold'}}
            secondary={<Typography variant="caption" > {course_.address_name}</Typography>}
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
        {searchinfo.length === 0? null: <DSList courses_ = {searchinfo}/>}
      </List>
    </Paper>
  );
}