import React, { useState,useRef, useEffect, useContext, Fragment } from 'react';
import { Amplify, Auth , Storage } from 'aws-amplify';

import AWS from 'aws-sdk';


/*
 * Configure the SDK to use anonymous identity 
 */


import { Box, TextField, Stack, Grid, InputLabel, IconButton, MenuItem, FormControl, Select , CircularProgress, Paper } from '@mui/material';
import { BaseContext, MapQContext, MapCRSQContext} from "../../context"

import DSInfoEdit from "../DSBasics/DSInfoHSTEdit.js"
import DSPolySelect from "../DSBasics/DSPolySelect"
import DSPolyHSTEdit from "../DSBasics/DSPolyHSTEdit"
import DSSave from '../DSBasics/DSSave';
import DSLabelHSTEdit from '../DSBasics/DSLabelHSTEdit';

import DSCoursePicker from '../DSBasics/DSCoursePicker.js';
import DSIMGView from './DSIMGView.js';

// import {
//   S3Client,
//   // This command supersedes the ListObjectsCommand and is the recommended way to list objects.
//   ListObjectsV2Command,
// } from "@aws-sdk/client-s3";

// const client = new S3Client({});


// AWS.config.update({
//   region: 'us-east-1',
//   credentials: new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: 'us-east-1:81ad79da-011a-4b19-8324-1e6528d1667e'
//   }),
//   // AWS_SDK_LOAD_CONFIG:1
// });



export default function DSIMGLabelMain() {
  
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, 
    setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
  const [AWSfolders, setAWSfolders] = useState([]);
  const [selected_folder,setSelectedFolder] = useState("public/");

    // const s3 = new AWS.S3({
    //   params: { Bucket: 'ds-niaimages' },
    //   region: 'us-east-1',
    //   credentials: new AWS.CognitoIdentityCredentials({
    //     IdentityPoolId: 'us-east-1:81ad79da-011a-4b19-8324-1e6528d1667e'
    //   }),
    // });
  
  let awsparams = { Bucket: 'ds-niaimages'}

  


  async function GetFolders(prefix_) {
    awsparams.Prefix = prefix_
    let allfolders_ = [];
    try {
      // Storage.list('') // for listing ALL files without prefix, pass '' instead
      // .then(({ results }) => console.log("AT LABEL",results))
      Auth.currentCredentials().then((creds) => {
        AWS.config.credentials = creds
        // new AWS.S3().listObjectsV2({ Bucket: 'ds-niaimages' ,Delimiter:'/', Prefix:'public/'},function (err, data) {
        new AWS.S3().listObjectsV2(awsparams,function (err, data) {
          if (err) {

                console.log(err)
          } else {
              var contents = data.Contents;
              console.log(contents)
              contents.forEach(function (file) {
                let path_ = file.Key.split("/").slice(0,-1).join("/") + '/'
                // console.log(path_)
                if (!allfolders_.includes(path_)) allfolders_ = [...allfolders_, path_];
              });
              console.log(allfolders_)
              setAWSfolders(allfolders_)

          // if (data.IsTruncated) {
          //     awsparams.ContinuationToken = data.NextContinuationToken;
          //     GetFolders(prefix_);
          // } 
             
          } 
        });
      })
      
    
    } catch (err) {
      console.log(err);
    }
  }


  useEffect(() => {
    setMode("LabelSelect");
    GetFolders('public/').then((x)=>{
      // let result = [];
      // let level = {result};

      // allfolders_.forEach(path => {
      //   path.split('/').reduce((r, name, i, a) => {
      //     if(!r[name]) {
      //       r[name] = {result: []};
      //       r.result.push({name, children: r[name].result})
      //     }
          
      //     return r[name];
      //   }, level)
      // })
      console.log(x)
      // setAWSfolders(x)
      // console.log(result)
    })
  },[]);

  useEffect(() => {
      // setAWSfolders(allfolders_)
      console.log("Folders:", AWSfolders)
  },[AWSfolders]);
 
  return (
    Object.keys(baseinfo).length === 0? 
    <CircularProgress />
    :
    <div>
      <Grid container spacing={0}>
        <Grid Grid item xs={12} md={2}>
          <Box component="div" height="90vh" sx={{ p: 2, border: '1px solid gray',gap: 2, 
          borderRadius: 0 , m: 1, flexDirection: 'column', display: 'flex', alignContent: 'flex-start'}}> 
          {AWSfolders.length === 0? <null/>:
            <FormControl fullWidth = {true}>
              <InputLabel id="ds-org-select-awsfolder">선택 정보</InputLabel>
              <Select
                labelId="ds-org-select-awsfolder"
                id="ds-awsfolder-select"
                value={selected_folder}
                label="선택 정보"
                onChange={(event) => {setSelectedFolder(event.target.value);}}
              >
                {
                AWSfolders.map((x)=> <MenuItem key={'Numhole'+x} value= {x} >{x}</MenuItem>)
                // console.log("Folders:", AWSfolders)
                }
              </Select>
            </FormControl>      
          }
          </Box>
        </Grid>
        <Grid Grid item xs={12} md={10}>

        </Grid>
      </Grid>    
    </div>  
  );
}