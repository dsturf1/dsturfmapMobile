import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';

import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography } from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';
import DSSearchEdit from './DSSearchEdit.js';

import { SInfoContext} from "../../context/DSSearchData.js"

export default function DSSearchPicker() {

  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord,addToDB, setAddToDB} = useContext(SInfoContext);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const DSList = ({ courses_ }) => {

    const list = courses_.map((course_, index) => 

      <ListItem key = {course_.id} divider={true}>
        <ListItemButton selected={selectedIndex === index} onClick={() => {setSelectedInfo(course_); setSelectedIndex(index);}}    
            sx={{
              "&.Mui-selected": {
                backgroundColor: "#03045e"
              },
              "&.Mui-focusVisible": {
                backgroundColor: "caf0f8"
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
    <Paper style={{height: '100%', overflow: 'auto'}}>
      <List dense={true}>
        {addToDB === true? <DSSearchEdit/>: (searchinfo.length === 0?  null : <DSList courses_ = {searchinfo}/>)}
      </List>
    </Paper>
  );
}