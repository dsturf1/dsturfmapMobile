

import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Auth } from 'aws-amplify';

import { FormGroup, FormControlLabel, InputLabel, Stack, Select, MenuItem, Box, Checkbox,TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup, Autocomplete} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SendIcon from '@mui/icons-material/Send';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, MapQContext, MapCRSQContext, PhotoContext} from "../../context/index.js"
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { COURSEBLANK , GEOJSONBLANK, POLYGONBLANK} from '../../constant/urlconstants.js';
import { label_Level1_info,  label_Level2_info, turf_type } from '../../constant/urlconstants.js';
import { BASEURL } from '../../constant/urlconstants.js';


import 'handsontable/dist/handsontable.full.min.css';
import Handsontable from 'handsontable/base';
import { HotTable} from '@handsontable/react';


import numbro from 'numbro';
import languages from "numbro/dist/languages.min.js";
import { registerAllModules } from 'handsontable/registry';
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, area, polygon } from "@turf/turf";



registerAllModules();
numbro.registerLanguage(languages["ko-KR"]);

const TypeList = ['TBD', '잔디현황', '작업사진', '방제일보', '계측기', 'NDVI', 'Thermal']



export default function DSPhotoHSTEdit() {

  const hotRef = useRef(null);


  const [columns, setCols] = useState([
    {name:'title', header:'항목', width:100, type:'text', readOnly:true},
    {name:'name', header:'값', width:160, editor: 'text', readOnly:false}
  ]);

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo} = useContext(BaseContext);

  const {pr_photojson, setPrPhotoJson, ds_photojson, setDSPhotoJson, selected_photojson, setSPhotoJson, 
    pr_imgURLs, setPrImgURLs, ds_imgURLs, setDSImgURLs,  photo_loading, setPhotoLoading}  = useContext(PhotoContext);
  
  useEffect(() => {

    if (selected_photojson === null) return

    var rows_ = [];

    rows_.push({title:'코스명',name:selected_photojson.location.Course})    
    rows_.push({title:'홀',name:selected_photojson.location.Hole})
    rows_.push({title:'사진타입',name:selected_photojson.info.type})
    rows_.push({title:'작성자',name:selected_photojson.by})
    rows_.push({title:'작성시점',name:selected_photojson.date})

    const hot = hotRef.current.hotInstance;

    hot.loadData(rows_)
  },[selected_photojson]);



  return (
      <Fragment>
        <HotTable
          ref={hotRef}
          // rowHeaders={true}
          rowHeights={25}
          startRows = {3}
          startCols = {2}

          colHeaders={columns.map((x)=>x.header)}
          // colWidths={columns.map((x)=>x.width)}
          columns = {columns.map((x)=>{return{data:x.name, readOnly: x.readOnly, type:x.type}})}
          // manualColumnResize={true}
          width={"100%"}
          stretchH= {'all'}
          fixedColumnsStart={2}
          cells= {(row, column) => {
            var cellMeta = {};
        
              if (row === 0 && column ==1) {
                cellMeta.type = 'dropdown';
                cellMeta.source = selected_course_info !== null?[...selected_course_info.course_names, "전코스"]:null
              }
              if (row === 1 && column ==1) {
                cellMeta.type = 'dropdown';
                cellMeta.source = [1,2,3,4,5,6,7,8,9]
              }
              if (row === 2 && column ==1) {
                cellMeta.type = 'dropdown';
                cellMeta.source = TypeList
              }                        

            return cellMeta;
          }
          }

          className = {'htCenter'}
          minSpareRows={0}
          licenseKey="non-commercial-and-evaluation" // for non-commercial use only

          // afterChange={(x, source) =>{if(typeof x === 'undefined' && x.length>0) console.log({...rows[x[0]],[x[1]]:x[4]})}}
          afterChange={(changes, source) => {
            changes?.forEach(([row, prop, oldValue, newValue]) => {

              let newInfo = {...selected_photojson}

                if (row === 0) newInfo = {...newInfo, location: {...newInfo.location, Course:newValue}}  
                if (row === 1) newInfo = {...newInfo, location: {...newInfo.location, Hole:newValue}}   
                if (row === 2) newInfo = {...newInfo, info: {...newInfo.info, type:newValue, typeId: TypeList.findIndex((x)=> x === newValue)}}   
                // update(newInfo)
                setSPhotoJson({...newInfo})
              let newDB_ = [...pr_photojson.filter((x)=> x.id !== selected_photojson.id),{...newInfo}].sort((a, b) => a.id.localeCompare(b.id))
                setPrPhotoJson([...newDB_])


              let newInfoUrls = {...pr_imgURLs.filter((x)=> x.id === selected_photojson.id)[0], location:newInfo.location, type:newInfo.info.type}

              let newDBUrls_ = [...pr_imgURLs.filter((x)=> x.id !== selected_photojson.id),{...newInfoUrls}].sort((a, b) => a.id.localeCompare(b.id))
                setPrImgURLs([...newDBUrls_])
                // if (row === 5) newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, Valid:newValue}}  
                // if (row === 6) newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, radius:Number(newValue)}} 
            });
          }}
          
        />
      </Fragment>
    )
  }
