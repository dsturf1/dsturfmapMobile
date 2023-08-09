import React, { useState, useEffect, useContext } from 'react';
import { Auth } from 'aws-amplify';

import { BaseContext} from "../../context"
import { Box, IconButton, Stack, Grid, Typography } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import DSMapSettingTableHST from './DSMapSettingTableHST.js';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import { BASEURL } from '../../constant/urlconstants.js';

const menu_ = [
  {name: 'Polygon등록', key_id: 'area_def'}
]



export default function DSMapSettingMain() {

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo} = useContext(BaseContext);
  const [saving, setSaving] = useState(false);
  const [selected_menu, setSelectedMenu] = useState(menu_[0])



  useEffect(() => {

     setEdited(false)
  },[]);

  useEffect(() => {

   console.log("EDIT", edited)
 },[edited]);

  const PostBaseInfo = async function (baseinfo_) 
  {

    const url_ = BASEURL + '/baseinfo?'+  new URLSearchParams({user: baseinfo.user.username });
    const myInit = {
      method: 'POST',
      body: JSON.stringify( baseinfo_),
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    try {
        const fetchData = await fetch(url_, myInit).then((response) => response.json())
        console.log('At Post', fetchData)
        return fetchData
        } catch (err) { console.log('Workinfo Saving Error', err, url_); return err; }
 
  }
  

  return (
    <Grid container spacing={0}>
        <Grid item xs={12} md={2}>
        <Box height="90vh" sx={{ p: 1, border: '1px solid grey',gap: 2, borderRadius: 2 , m: 1}}>
            <FormControl fullWidth = {true}>
              <InputLabel id="ds-org-select-baseinfo">선택 정보</InputLabel>
              <Select
                labelId="ds-org-select-baseinfo"
                id="ds-baseinfo-select"
                value={selected_menu}
                label="선택 정보"
                onChange={(event) => {setSelectedMenu(event.target.value);}}
              >
                {menu_.map((x)=> <MenuItem value= {x} >{x.name}</MenuItem>)}
              </Select>
            </FormControl>
            <LoadingButton  sx={{ width: 1, height:60, mt:1}}  
                onClick={()=>{  setSaving(true);PostBaseInfo(baseinfo).then((x) => {setSaving(false);setEdited(false)})}}
                  
                disabled = {!edited} loading={saving}          
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="contained"
              >
                <span>Save</span>
            </LoadingButton>
          </Box>
        </Grid>
        <Grid item xs={12} md={10}>
          <DSMapSettingTableHST selected_menu = {selected_menu}/>
        </Grid>
      </Grid>
        

  );
}