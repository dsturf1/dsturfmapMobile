import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';
import { Amplify, Auth , Storage } from 'aws-amplify';

import AWS from 'aws-sdk';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Button,  ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { BaseContext, MapQContext, MapCRSQContext} from "../../context"

import DSInfoEdit from "../DSBasics/DSInfoHSTEdit.js"
import DSPolySelect from "../DSBasics/DSPolySelect"
import DSPolyHSTEdit from "../DSBasics/DSPolyHSTEdit"
import DSSave from '../DSBasics/DSSave';
import DSLabelHSTEdit from '../DSBasics/DSLabelHSTEdit';

import DSCoursePicker from '../DSBasics/DSCoursePicker.js';
import DSIMGView from './DSIMGViewYAIV';
// import DSIMGAnnotorious from './DSIMGAnnotorious';
// import DSIMGView from './DSIMGViewOpenSD';
// import DSIMGAnnotate from './DSIMGAnnotate.js';

// import DropdownTreeSelect from 'react-dropdown-tree-select';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import '@fortawesome/fontawesome-svg-core/styles.css'

import "./label.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import fontawesome from '@fortawesome/fontawesome'

export default function DSIMGLabelMain() {
  
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, 
    setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, se5Gon} = useContext(BaseContext);

  const [awsFolderInfo, setAWSFolderInfo] = useState([]);
  const [awsFileList, setAWSFileList] = useState([]);
  const [labeljson, setLabelJson] = useState([]);

  const [selectedFileList, setSelectedFileList] = useState([]);
  const [selectedRGBFileList, setSelectedRGBFileList] = useState([]);
  const [selectedThumbFileList, setSelectedThumbFileList] = useState([]);

  const [totalJPG, setTotalJPG] = useState(0)
  const [selected_folder,setSelectedFolder] = useState("public/");
  const [imgURLs, setImgURLs] = useState([{src:"",desc:""}]);
  const [imgURL, setImgURL] = useState({});
  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState([]);

  const [selectedIndex, setSelectedIndex] = React.useState(-1);


  const DSIMGList = ({ imgURLs }) => {

    const list = imgURLs.map((img, index) => 

      <ListItem key = {img.id} divider={true} style={{ paddingTop: 0, paddingBottom: 0, margin: 0 }}>
        <ListItemButton style={{ lineHeight: 1, margin: 0 }} selected={selectedIndex === index} onClick={() => {
          setImgURL({...img})
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
        <img 
          src={img.thumb}      
          width='43px' 
          height='32px'   
          alt="Hallstatt Town Square" />
        {/* <ListItemText
          disableTypography
          primary={
            <Stack direction="row" justifyContent="space-between"  alignItems="center" >
              <Typography variant="body2" style={{ fontWeight: 'bold' ,color: selectedIndex === index? '#ffffff':'#000000'}} > {"["+(index + 1)+"]"+ img.id}</Typography>
            </Stack>
          }
        /> */}
        </ListItemButton>
      </ListItem>
    )

    return list
  }



  function GetFolderAndFiles(response) {
    let result = [];
    let level = {result};

    // console.log(response[1].split('/').reduce((r, name, i, a) => console.log(r, name, i, a)),response[1])
    
    response.forEach((path) =>
      path.split('/').reduce((r, name, i, a) => {
        if(!r[name]) {
          if(name !==''){
          r[name] = {result: [] , prev:'/'+name};
          if (name.endsWith('.JPG')) r.result.push({name, label:name, value:path,title:name, description:path, type:'file'})
          else r.result.push({name, label:name, value:'/'+ path.split('/').slice(0,i+1).join('/'), children: r[name].result, type:'folder'})
          }
        }
        return r[name];
      }, level)
    )
    return result;
  }

  function GetFolderList(response) {
    let result = [];
    let level = {result};

    // console.log(response[1].split('/').reduce((r, name, i, a) => console.log(r, name, i, a)),response[1])
    
    response.forEach((path) =>
      path.split('/').reduce((r, name, i, a) => {
        if(!r[name]) {
          if(name !==''){
          r[name] = {result: [] , prev:'/'+name};
          if (!name.endsWith('.JPG')) r.result.push({name, label:name, value:path.split('/').slice(0,i+1).join('/'), children: r[name].result, type:'folder'})
          }
        }
        return r[name];
      }, level)
    )
    return result;
  }

  async function GetFolders() {
    let folders_ = []
    Storage.list('') // for listing ALL files without prefix, pass '' instead
      .then(({ results }) => {
        // console.log( processStorageListV2(results))
        setTotalJPG(results.filter((x) => x.key.includes('.JPG') && x.key.includes('rgb') && !x.key.includes('thumb')).length)
        // setAWSFileList(results.filter((x) => x.key.endsWith('.JPG')));
        folders_ = GetFolderList(results.filter((x) => x.key.includes('.JPG') && x.key.includes('rgb')&& !x.key.includes('thumb')).map((item) => item.key))
        setAWSFolderInfo(folders_);
      }    
    )
    .catch((err) => alert(err));
  }


  async function getDataJson(checked_) {

    // console.log(checked.map(x=>x.split('/').slice(0, 2).join('/')))


    let folders_ = [...new Set(checked.map(x=>x.split('/').slice(0, 2).join('/')))]

    for (const f_ of folders_){
      
      console.log("reading json:", f_ + '/data.json')
      const result = await Storage.get(f_ + '/data.json',  { download: true , cacheControl: 'no-cache'});
      const datajson = await new Response(result.Body).json();
      setLabelJson([...labeljson, ...datajson])
    }
  }

  async function getImgUrl() {
    const signedURL = await Promise.all(selectedFileList.map(x => {return Storage.get(x.key)}))
    return signedURL
  }

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
    setMode("LabelSelect");
    GetFolders()
  },[]);

  useEffect(() => {
      // setAWSfolders(allfolders_)
      console.log("Folders:", awsFolderInfo)
  },[awsFolderInfo]);

  useEffect(() => {
    // setAWSfolders(allfolders_)
    console.log("Files:", awsFileList)
},[awsFileList]);

  useEffect(() => {
    // GetImageFileKey(selected_folder)
    console.log(selectedRGBFileList.map((x)=>x.key))
    

},[selectedRGBFileList]);

useEffect(() => {

  if (checked.length ===0) {
    setLabelJson([]);
    return
  }
  getDataJson(checked);
},[checked]);

useEffect(() => {
  console.log("ImgURLs",imgURLs)
  // console.log(checked.map((x)))
  // GetImg(imgURLs[0])
  // getImgUrlSet().then(result=>{console.log(result)})
    // setImgURL(imgURLs[30])

},[imgURLs]);


useEffect(() => {
  if(labeljson.length === 0) {
    setImgURLs([])
    return
  }


  console.log("Data:", labeljson);

  let data2Url = labeljson.filter((x) => x.dest.thumb !== '').map(item => {return {
    id:item.id,
    desc:item.info.desc,
    rgb:item.dest.rgb.replace(/\\/g, '/'), 
    ndvi:item.dest.ndvi.replace(/\\/g, '/'), 
    thumb:item.dest.thumb.replace(/\\/g, '/')}
  })

  getImgUrlSet(data2Url).then((result) => {console.log("URL", result); setImgURLs([...result])})
},[labeljson]);




  return (
    Object.keys(baseinfo).length === 0? 
    <CircularProgress />
    :
    <div>
      <Grid container spacing={0}>
        <Grid Grid item xs={12} md={2}>
          <Box component="div" height="90vh" sx={{ p: 2, border: '1px solid gray',gap: 2, 
            borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex', alignContent: 'flex-start', overflow:'auto', overflowX: "scroll"}}> 
            <Button variant= {checked.length === 0 ? "outlined":"contained"} onClick = {()=> {
                // getImgUrl().then(result=>{setImgURLs(result.map((x, index)=>{return {src:x.urlrgb, title:selectedFileList[index].key, description:selectedFileList[index].key}}))})
            }}> 총 {totalJPG} 이미지 중 {selectedFileList.length} 선택</Button>
              <CheckboxTree
                nodes={awsFolderInfo}
                checked={checked}
                expanded={expanded}
                onCheck={(checked) => setChecked(checked)}
                onExpand={(expanded) => {console.log(expanded); setExpanded(expanded)}}
              />
              <Box component="div" sx={{ p: 2, border: '1px solid gray',gap: 2, 
                  borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex', alignContent: 'flex-start', overflow:'auto', overflowX: "scroll"}}> 
              {imgURLs.length>0? <DSIMGList imgURLs = {imgURLs}/>:<null></null>}
              </Box>

          </Box>
        </Grid>
        <Grid Grid item xs={12} md={10}>
        <Box component="div" height="90vh" sx={{ p: 2, border: '1px solid gray',gap: 2, 
            borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex', alignContent: 'flex-start', overflow:'auto', overflowX: "scroll"}}> 
          {/* <DSIMGView image = {imgURL}/> */}
          {/* <DSIMGAnnotorious image = {imgURL}/> */}
          {imgURLs.length>0 ? <DSIMGView DSslides={imgURLs}/>:<null/>} 
          {/* {console.log(imgURLs.length)} */}
          </Box>
        </Grid>
      </Grid>    
    </div>  
  );
}