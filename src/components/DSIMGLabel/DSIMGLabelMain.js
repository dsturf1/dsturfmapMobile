import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';
import { Amplify, Auth , Storage } from 'aws-amplify';

import AWS from 'aws-sdk';

import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Button } from '@mui/material';
import { BaseContext, MapQContext, MapCRSQContext} from "../../context"

import DSInfoEdit from "../DSBasics/DSInfoHSTEdit.js"
import DSPolySelect from "../DSBasics/DSPolySelect"
import DSPolyHSTEdit from "../DSBasics/DSPolyHSTEdit"
import DSSave from '../DSBasics/DSSave';
import DSLabelHSTEdit from '../DSBasics/DSLabelHSTEdit';

import DSCoursePicker from '../DSBasics/DSCoursePicker.js';
import DSIMGView from './DSIMGViewYAIV';
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
  const [awsFileInfo, setAWSFileInfo] = useState([]);
  const [totalJPG, setTotalJPG] = useState(0)
  const [selected_folder,setSelectedFolder] = useState("public/");
  const [imgURLs, setImgURLs] = useState([]);
  const [imgUrl, setImgUrl] = useState("");
  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState([]);


  function processStorageListV2(response) {
    let result = [];
    let level = {result};

    // console.log(response[1].split('/').reduce((r, name, i, a) => console.log(r, name, i, a)),response[1])
    
    response.forEach((path) =>
      path.split('/').reduce((r, name, i, a) => {
        if(!r[name]) {
          if(name !==''){
          r[name] = {result: [] , prev:'/'+name};
          if (name.endsWith('.JPG')) r.result.push({name, label:name, value:path,title:name, description:path})
          else r.result.push({name, label:name, value:'/'+ path.split('/').slice(0,i+1).join('/'), children: r[name].result, expandDisabled:true})
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
        folders_ = processStorageListV2(results.filter((x) => x.key.endsWith('.JPG')).map((item) => item.key))
        setTotalJPG(results.filter((x) => x.key.endsWith('.JPG')).length)
        assignObjectPaths(folders_);
        console.log(folders_)
        setAWSFileInfo(folders_);
      }    
    )
    .catch((err) => alert(err));
  }

  async function getImgUrl() {
    const signedURL = await Promise.all(checked.map(key_ => {return Storage.get(key_)}))
    return signedURL
  }
  
  const assignObjectPaths = (obj, stack) => {
    Object.keys(obj).forEach(k => {
      const node = obj[k];
      if (typeof node === "object") {
        node.path = stack ? `${stack}.${k}` : k;
        assignObjectPaths(node, node.path);
      }
    });
  };

  useEffect(() => {
    setMode("LabelSelect");
    GetFolders()
  },[]);

  useEffect(() => {
      // setAWSfolders(allfolders_)
      console.log("Folders:", awsFileInfo)
  },[awsFileInfo]);

  useEffect(() => {
    // GetImageFileKey(selected_folder)

},[selected_folder]);

useEffect(() => {
  // console.log(checked)
  // console.log(checked.map((x)))
  // GetImg(imgURLs[0])

    // setImgURLs(result)})

},[checked]);




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
                getImgUrl().then(result=>{console.log(result.map((x, index)=>{return {src:x, title:awsFileInfo[index]}})); 
                setImgURLs(result.map((x, index)=>{return {src:x, title:checked[index], description:checked[index]}}))})
            }}> 총 {totalJPG} 이미지 중 {checked.length} 선택</Button>
              <CheckboxTree
                nodes={awsFileInfo}
                checked={checked}
                expanded={expanded}
                onCheck={(checked) => setChecked(checked)}
                onExpand={(expanded) => {console.log(expanded); setExpanded(expanded)}}
              />
          </Box>
        </Grid>
        <Grid Grid item xs={12} md={10}>
        <Box component="div" height="90vh" sx={{ p: 2, border: '1px solid gray',gap: 2, 
            borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex', alignContent: 'flex-start', overflow:'auto', overflowX: "scroll"}}> 
          <DSIMGView DSslides = {imgURLs}/>
          </Box>
        </Grid>
      </Grid>    
    </div>  
  );
}