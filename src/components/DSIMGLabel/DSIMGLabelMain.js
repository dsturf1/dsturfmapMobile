import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';
import { Amplify, Auth , Storage } from 'aws-amplify';

import AWS from 'aws-sdk';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Button,  ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { BaseContext, MapQContext, MapCRSQContext, LabelContext} from "../../context"
import { course_list_label, captured_date_label } from '../../constant/labelconstants';

import DSInfoEdit from "../DSBasics/DSInfoHSTEdit.js"
import DSPolySelect from "../DSBasics/DSPolySelect"
import DSPolyHSTEdit from "../DSBasics/DSPolyHSTEdit"
import DSSave from '../DSBasics/DSSave';
import DSLabelHSTEdit from '../DSBasics/DSLabelHSTEdit4Label';

import DSCoursePicker from '../DSBasics/DSCoursePicker.js';
import DSIMGView from './DSIMGViewReactView';
import DSIMGAnnotorious from './DSIMGAnnotorious';
// import DSIMGView from './DSIMGViewOpenSD';
// import DSIMGView from './DSIMGViewYAIVwithImgList';
// import DSIMGAnnotate from './DSIMGAnnotate.js';

// import DropdownTreeSelect from 'react-dropdown-tree-select';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import '@fortawesome/fontawesome-svg-core/styles.css'

import "./label.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { label } from 'yet-another-react-lightbox';
// import fontawesome from '@fortawesome/fontawesome'




export default function DSIMGLabelMain() {
  
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, 
    setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, se5Gon} = useContext(BaseContext);

  const {labeljson, setLabelJson, selected_labeljson, setSLabelJson, imgURLs, setImgURLs, selected_singlelabel, setSSLabel, 
    selected_capdate, setCapDate, selected_area_desc, setAreaDesc,label_loading, setLabelLoading} = useContext(LabelContext);



  const [awsFolderInfo, setAWSFolderInfo] = useState([]);
  const [flatFolderInfo, setFlatFolderInfo] = useState([]);


  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState([]);


  useEffect(() => {
    if(checked.length ===0) return

    let datajson_ = [...flatFolderInfo] 
    checked.forEach((checked_) => {
      let tmpLabel = labeljson.filter((x) => x.destFolder === checked_)

      datajson_ = [...datajson_.filter((x) => x.path !== checked_), 
        {
          'path': checked_, 'file_cnt':tmpLabel.length, 
          'labeled_file_cnt':tmpLabel.filter((x)=> x.label.length !==0).length - tmpLabel.filter((x)=> x.label.some(e => e.level1 === 'TBD')).length,
          'TBD_file_cnt':tmpLabel.filter((x)=> x.label.some(e => e.level1 === 'TBD')).length
        }
      ]
      // console.log("@Main #Total, #Labeled, #TBD",tmpLabel.length, tmpLabel.filter((x)=> x.label.length ===0).length , 
      // tmpLabel.filter((x)=> x.label.some(e => e.level1 === 'TBD')).length,checked_)
    })
    console.log("@Main #Total, #Labeled, #TBD",labeljson.length, labeljson.filter((x)=> x.label.length ===0).length , 
      labeljson.filter((x)=> x.label.some(e => e.level1 === 'TBD')).length, checked)

    // let datajson_ = []  
    setFlatFolderInfo(datajson_)
    setAWSFolderInfo(GetFolderList(datajson_));

    saveFolderInfo( JSON.stringify(datajson_))


    
    },[labeljson]);

  async function saveFolderInfo(file_){
    try {
      await Storage.put(selected_course + '/'+selected_capdate + '/filepath_'+ selected_course+'_'+selected_capdate+'.json', file_)
    } catch (error) {
      console.log("Error uploading file: ", error);
    }

  }



  function GetFolderList(fileinfo_) {
    let result = [];
    let level = {result};

    // console.log(response[1].split('/').reduce((r, name, i, a) => console.log(r, name, i, a)),response[1])

    let response = fileinfo_.map((x)=>x.path)
    
    response.forEach((path_) =>
      path_.split('/').reduce((r, name, i, a) => {
        if(!r[name]) {
          if(name !==''){
            r[name] = {result: [] , prev:'/'+name};
            if (!name.endsWith('.JPG')) {
              let file_cnt = fileinfo_.filter((x)=>x.path.includes(path_.split('/').slice(0,i+1).join('/'))).reduce((total, obj) => obj.file_cnt + total,0)
              let labeled_file_cnt = fileinfo_.filter((x)=>x.path.includes(path_.split('/').slice(0,i+1).join('/'))).reduce((total, obj) => obj.labeled_file_cnt+ total,0)
              // let file_cnt = 0
              let newname = name
              if( i === 0) newname = baseinfo.course_info.filter((x) => x.id === selected_course)[0].name

              r.result.push({name, label:newname + ' [' + labeled_file_cnt+'/'+ file_cnt + ']', numOffiles: file_cnt, value:path_.split('/').slice(0,i+1).join('/'), 
              children: r[name].result, 
              type:'folder'})
            }
          }
        }
        return r[name];
      }, level)
    )
    return result;
  }

  async function GetFolders() {
    let folders_ = []

    const result = await Storage.get(selected_course + '/'+selected_capdate + '/filepath_'+ selected_course+'_'+selected_capdate+'.json',  
        { download: true , cacheControl: 'no-cache'});
    let datajson_ = await new Response(result.Body).json();

    folders_ = GetFolderList(datajson_)
    setFlatFolderInfo(datajson_)
    setAWSFolderInfo(folders_);
    console.log("Filepath",datajson_)

  }





  useEffect(() => {
    setMode("DATAselect");
  },[]);

  useEffect(() => {
    if (selected_course === "MGC000" || selected_capdate ==="") return

    GetFolders();
    setChecked([])

  },[selected_capdate]);



  useEffect(() => {

  // if (checked.length ===0) {
  //   setLabelJson([])
  //   return 
  // }

    
    // console.log(flatFolderInfo.filter((x)=>checked.some((item) => item === x.path)).reduce((accumulator, object) => {
    //   return accumulator + object.file_cnt;
    // }, 0), checked, flatFolderInfo)


  },[checked]);

// useEffect(() => {
//   console.log("ImgURLs",imgURLs)

// },[imgURLs]);


  useEffect(() => {
    if(labeljson.length === 0) {
      setImgURLs([])
      return
    }

  },[labeljson]);




  return (
    Object.keys(baseinfo).length === 0? 
    <CircularProgress />
    :
    <div>
      <Grid container spacing={0}>
        <Grid Grid item xs={12} md={2}>
          <Box component="div" height="90vh" sx={{ p: 2, border: '1px solid gray',gap: 2, 
            borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex', alignContent: 'flex-start'}}> 
            
            { selected_course === 'MGC000'? <DSCoursePicker/>:
              <>

              <FormControl  size="small">
                <InputLabel id="ds-capdate-select-label">촬영일자</InputLabel>
                <Select
                  labelId="ds-capdate-select-label"
                  id="ds-capdate-select"
                  value={selected_capdate}
                  label="촬영일자"
                  onChange={(event) => {setCapDate(event.target.value)}}
                >
                  {captured_date_label.filter((x)=> x.id === selected_course)[0].capdate.map((x) =>  <MenuItem key={'date'+x} value={x}>{x}</MenuItem>)}
                </Select>
              </FormControl>
              <Box component="div" height="40vh" sx={{ p: 2, border: '1px solid gray',gap: 0, 
                borderRadius: 0 , m: 0, flexDirection: 'column', display: 'flex', alignContent: 'flex-start', overflow:'auto'}}> 
                <CheckboxTree
                  nodes={awsFolderInfo}
                  checked={checked}
                  expanded={expanded}
                  onCheck={(checked) => setChecked(checked)}
                  onExpand={(expanded) => {setExpanded(expanded)}}
                />
              </Box>
                <Button variant= {checked.length === 0 ? "outlined":"contained"} onClick = {()=> {
                  
                
                  let selectedAreaDesc_ = [] 
                  let total_file_cnt = flatFolderInfo.filter((x)=>checked.some((item) => item === x.path)).reduce((accumulator, object) => {
                    return accumulator + object.file_cnt}, 0)

                  checked.forEach((x) =>{
                    selectedAreaDesc_  = [...selectedAreaDesc_ , {area:x.split('/')[1] ,desc:x.split('/')[2]}]                
                  })


                  console.log('AREA&Desc',selectedAreaDesc_,total_file_cnt)
                  if(total_file_cnt > 1500) {
                    alert("인간적으로 1000개이상 이미지는 힘들어요")
                    return
                  }

                  setAreaDesc(selectedAreaDesc_)
                  setMode('GRPLABEL')
                }}> 
                  총 
                  {flatFolderInfo.reduce((accumulator, object) => {
                  return accumulator + object.file_cnt}, 0)} 
                  이미지 중 
                  {flatFolderInfo.filter((x)=>checked.some((item) => item === x.path)).reduce((accumulator, object) => {
                  return accumulator + object.file_cnt}, 0)} 
                  선택
                </Button>

                {selected_mode !== 'DATAselect'? <DSLabelHSTEdit/>:null}
              </>
            }


          </Box>
        </Grid>
        <Grid Grid item xs={12} md={10}>
        <Box component="div" height="90vh" sx={{ p: 2, border: '1px solid gray',gap: 2, 
            borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex', alignContent: 'flex-start', overflow:'auto', overflowX: "scroll"}}> 
          {/* <DSIMGView image = {imgURL}/> */}
          {/* <DSIMGAnnotorious image = {imgURL}/> */}
          {imgURLs.length>0 && selected_mode !== 'DATAselect'? (label_loading === false? <DSIMGView DSslides={imgURLs}/>:<CircularProgress />):
          (label_loading === false? <null/>:<CircularProgress />)} 
          {/* {console.log(imgURLs.length)} */}
          </Box>
        </Grid>
      </Grid>    
    </div>  
  );
}