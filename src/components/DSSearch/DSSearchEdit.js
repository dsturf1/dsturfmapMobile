import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';

import { FormControl, InputLabel, Stack, Select, MenuItem, TextField, Avatar, Paper, List, Typography ,Button, ButtonGroup} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { SInfoContext} from "../../context/DSSearchData.js"

export default function DSSearchEdit() {

  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord} = useContext(SInfoContext);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [numHole, setNumHole] = React.useState(9);
  const Textrefs = useRef([]);

  const DSList = () => {

    let list = Array.from({length: parseInt(numHole/9)}, (_, i) => i + 1);
    Textrefs.current = list.map(() => createRef());


    let Tlist = list.map((x, index) =>
        <Stack direction="row" spacing={2}   justifyContent="center"  alignItems="center" mt = {2}>
          <Typography variant="button" > 제 {x} 코스명</Typography>
          <TextField id={"ds-course-name" + x} label={"코스명" + x} variant="outlined" justifyContent="center"  alignItems="center" mt = {2} size="small" inputRef={Textrefs.current[index]}/>
        </Stack>
      )

    return Tlist
  }

  useEffect(() => {

    console.log(Textrefs)

  },[numHole]);

  const getAllCourseName = ()=>{
    console.log(Textrefs.current.map((x)=>x.current.value))
  }
 
  return (
    <Paper style={{height: '100%', overflow: 'auto'}}>
      <Stack direction="row" spacing={2}   justifyContent="center"  alignItems="center" mt = {2}>
        <Typography variant="button" > 홀수</Typography>
        <FormControl  size="small" sx={{ m: 1, width: 200 }}>
          <InputLabel id="ds-numhole-select-label">Hole</InputLabel>
          <Select
            labelId="ds-numhole-select-label"
            id="ds-numhole-select"
            value={numHole}
            label="홀수"
            onChange={(event) => {setNumHole(event.target.value)}}
          >
            {[9,18,27,36,45,54,63,72,81].map((x) =>  <MenuItem key={'Numhole'+x} value={x}>{x}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>
      <Stack direction="column" spacing={2}   justifyContent="center"  alignItems="center" mt = {2}>
        <DSList/>
      </Stack>
      <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={2}   justifyContent="center"  alignItems="center" sx={{ mt: 5 }}>
        <Button variant="outlined"  onClick={() => {getAllCourseName()}}> Save</Button>
        <Button variant="outlined"  onClick={() => {getAllCourseName()}}> Cancel</Button>
      </ButtonGroup>
    </Paper>
  );
}