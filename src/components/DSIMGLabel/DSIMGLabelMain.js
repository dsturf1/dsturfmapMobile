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
import DSIMGView from './DSIMGViewYAIVwithImgList';
import DSIMGAnnotorious from './DSIMGAnnotorious';
// import DSIMGView from './DSIMGViewOpenSD';
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

  const {labeljson, setLabelJson, selected_labeljson, setSLabelJson, imgURLs, setImgURLs, selected_singlelabel, setSSLabel, selected_capdate, setCapDate} = useContext(LabelContext);



  const [awsFolderInfo, setAWSFolderInfo] = useState([]);
  const [flatFolderInfo, setFlatFolderInfo] = useState([]);


  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState([]);



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

    const result = await Storage.get(selected_course + '/'+selected_capdate + '/filepath_'+ selected_course+'_'+selected_capdate+'.json',  { download: true , cacheControl: 'no-cache'});
    let datajson_ = await new Response(result.Body).json();

    folders_ = GetFolderList(datajson_)
    setFlatFolderInfo(datajson_)
    setAWSFolderInfo(folders_);
    console.log("Filepath",datajson_)

    // Storage.list(selected_course + '/'+selected_capdate, { pageSize: 'ALL' }) // for listing ALL files without prefix, pass '' instead
    //   .then(({ results }) => {
    //     folders_ = GetFolderList(results.filter((x) => x.key.includes('.JPG') && x.key.includes('rgb')&& !x.key.includes('thumb')).map((item) => item.key))
    //     setAWSFolderInfo(folders_);
    //   }    
    // )
    // .catch((err) => alert(err));
  }


  // async function getDataJson() {
      
  //   console.log("reading json:", selected_course + '/'+selected_capdate + '/data.json')
  //   const result = await Storage.get(selected_course + '/'+selected_capdate +  '/data.json',  { download: true , cacheControl: 'no-cache'});
  //   const datajson_ = await new Response(result.Body).json();
  //   setLabelJson([ ...datajson_])
  // }

  async function getImgUrlSet(keyset) {
    const signedURL = await Promise.all(keyset.map(async (x) => {
      return {
        id:x.id,
        desc:x.desc,
        width:800,
        height:600,
        src:await Storage.get(x.rgb, {
          // validateObjectExistence: true 
        }), 
        rgb:await Storage.get(x.rgb, {
          // validateObjectExistence: true 
        }), 
        thumb:await Storage.get(x.thumb, {
          // validateObjectExistence: true 
        }),  
        ndvi:await Storage.get(x.ndvi, {
          // validateObjectExistence: true 
        }), 
      }
    }))
    return signedURL
  } 


  useEffect(() => {
    setMode("DATAselect");
    // GetFolders()
  },[]);

  useEffect(() => {
    if (selected_course === "MGC000" || selected_capdate ==="") return

    GetFolders();
    // getDataJson();

  },[selected_capdate]);

  useEffect(() => {
      // setAWSfolders(allfolders_)
      console.log("Folders:", awsFolderInfo)
  },[awsFolderInfo]);

useEffect(() => {

  if (checked.length ===0) {
    setSLabelJson([])
    return 
  }

    // let searchC = checked.map((x) => x.split('/'))
  
    // let selectedJson = [] 

    // searchC.forEach((x) =>{
  
    //   // console.log(labeljson.filter((item) => item.info.area === x[2] && item.info.desc === x[3]),x[2],x[3])
    //   selectedJson = [...selectedJson, ...labeljson.filter((item) => item.info.area === x[2] && item.info.desc === x[3])]
  
    // })

    // setSLabelJson(selectedJson)
    
    console.log(flatFolderInfo.filter((x)=>checked.some((item) => item === x.path)).reduce((accumulator, object) => {
      return accumulator + object.file_cnt;
    }, 0), checked, flatFolderInfo)


},[checked]);

// useEffect(() => {
//   console.log("ImgURLs",imgURLs)

// },[imgURLs]);


// useEffect(() => {
//   if(labeljson.length === 0) {
//     setImgURLs([])
//     return
//   }


//   console.log("Data:", labeljson);


// },[labeljson]);




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
                  {captured_date_label.filter((x)=> x.id === selected_course).map((x) =>  <MenuItem key={'date'+x.capdate} value={x.capdate}>{x.capdate}</MenuItem>)}
                </Select>
              </FormControl>

                <CheckboxTree
                  nodes={awsFolderInfo}
                  checked={checked}
                  expanded={expanded}
                  onCheck={(checked) => setChecked(checked)}
                  onExpand={(expanded) => {setExpanded(expanded)}}
                />
                {/* <Box component="div" sx={{ p: 2, border: '1px solid gray',gap: 2, 
                    borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex', alignContent: 'flex-start', overflow:'auto', overflowX: "scroll"}}> 
                {imgURLs.length>0? <DSIMGList imgURLs = {imgURLs}/>:<null></null>}
                </Box> */}
                <Button variant= {checked.length === 0 ? "outlined":"contained"} onClick = {()=> {
                  let searchC = checked.map((x) => x.split('/'))
                
                  let selectedJson = [] 

                  searchC.forEach((x) =>{
                
                    // console.log(labeljson.filter((item) => item.info.area === x[2] && item.info.desc === x[3]),x[2],x[3])
                    selectedJson = [...selectedJson, ...labeljson.filter((item) => item.info.area === x[2] && item.info.desc === x[3])]
                
                  })

                  if(selectedJson.length > 1000) {
                    alert("인간적으로 1000개이상 이미지는 힘들어요")
                    return
                  }

                  setSLabelJson(selectedJson)

                  let data2Url = selectedJson.filter((x) => x.dest.thumb !== '').map(item => {return {
                    id:item.id,
                    desc:item.info.desc,
                    rgb:item.dest.rgb.replace(/\\/g, '/'), 
                    ndvi:item.dest.ndvi.replace(/\\/g, '/'), 
                    thumb:item.dest.thumb.replace(/\\/g, '/')}
                  })

                  getImgUrlSet(data2Url).then((result) => {console.log("URL", result); setImgURLs([...result]);setMode('GRPLABEL')})
                }}> 총 {labeljson.length} 이미지 중 {flatFolderInfo.filter((x)=>checked.some((item) => item === x.path)).reduce((accumulator, object) => {
                  return accumulator + object.file_cnt;
                }, 0)} 선택</Button>
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
          {imgURLs.length>0 && selected_mode !== 'DATAselect'? <DSIMGView DSslides={imgURLs}/>:<null/>} 
          {/* {console.log(imgURLs.length)} */}
          </Box>
        </Grid>
      </Grid>    
    </div>  
  );
}