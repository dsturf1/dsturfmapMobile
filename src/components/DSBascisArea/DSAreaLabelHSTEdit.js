

import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Amplify, Auth , Storage } from 'aws-amplify';

import { FormGroup, FormControlLabel, InputLabel, Stack, Select, MenuItem, Box, Checkbox,TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup, Autocomplete} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SendIcon from '@mui/icons-material/Send';
import { green, pink ,indigo, amber} from '@mui/material/colors';

import { BaseContext, MapQContext, MapCRSQContext, LabelContext} from "../../context/index.js"
import { COURSEBLANK , GEOJSONBLANK, POLYGONBLANK} from '../../constant/urlconstants.js';
// import { label_Level1_info,  label_Level2_info, turf_type , label_single} from '../../constant/urlconstants';
import {label_single} from '../../constant/labelconstants.js';
import { BASEURL } from '../../constant/urlconstants.js';


import 'handsontable/dist/handsontable.full.min.css';
import Handsontable from 'handsontable/base';
import { HotTable} from '@handsontable/react';

import { read, utils, writeFileXLSX } from 'xlsx';


import numbro from 'numbro';
import languages from "numbro/dist/languages.min.js";
import { registerAllModules } from 'handsontable/registry';
import { WindPowerSharp } from '@mui/icons-material';

const label_single_blank = JSON.parse(JSON.stringify(label_single));

registerAllModules();
numbro.registerLanguage(languages["ko-KR"]);


export default function DSLabelHSTEdit({geojson_mode}) {
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo,
    selected_polygon, setPolyGon} = useContext(BaseContext);

  const {geojsoninfo, setGeoJsonInfo,targetpolygons, setTargetPolygons, 
    targetpoints, setTargetPoints, isLoading, setIsLoading} = useContext(MapQContext);

  const [label_Level1_info, setL1]  =useState([]);
  const [label_Level2_info, setL2]  =useState([]);
  // const [label_Level3_info, setL3]  =useState([]);
  const [turf_type, setTurfType]  =useState([]);
  // const [localmode, setLocalMode] = useState(geojson_mode)

  const hotRef = useRef(null);

  const columns = [
    {name:'level1', header:'L1', type:'text', readOnly:false, width:80},
    {name:'level2', header:'L2', type:'text', readOnly:false, width:110},
    // {name:'level3', header:'L3', type:'text', readOnly:false, width:90},
    {name:'TurfType', header:'TurfType', type:'text', readOnly:false, width:80},
  ];
  

  useEffect(() => {
    if(Object.keys(baseinfo).length ===0) return

    let L1 = [...new Set(baseinfo.label_info.map(item => item.L1))]
    let L2 = []
    // let L3 = []
    let tmp = []

    tmp = L1.map((level_) => baseinfo.area_label_info.filter(item => item.L1 === level_).map(x=>x.L2))

    tmp.forEach((L2_)=>
    {
      // console.log(L2_,[...new Set(L2_)])
      L2.push([...new Set(L2_)])
    })

    // tmp = [...new Set(baseinfo.label_info.map(item => item.L2))]

    // let L3_tmp = tmp.map((level_) => baseinfo.label_info.filter(item => item.L2 === level_).map(x=>x.L3))

    // L3_tmp.forEach((L3_)=>
    // {
    //   console.log(L3_,[...new Set(L3_)])
    //   L3.push([...new Set(L3_)])
    // })
    let turf_ = [...new Set(baseinfo.turf_type.map(item => item.turf_type))]


    setL1([...L1])
    setL2([...L2])
    // setL3([...L3])
    setTurfType([...turf_])


    // console.log("Labeliis", L1,L2,L3,turf_)


  },[baseinfo]);

  useEffect(() => {

    if (hotRef.current === null) return;

    const hot = hotRef.current.hotInstance;
    
    if (selected_polygon === null) {
      hot.loadData([label_single])
      return
    }

    var rows_ = [];


    selected_polygon.properties.Labels.map((x) => rows_.push({
      level1:x.level1,
      level2:x.level2,
      // level3:x.level2,
      TurfType:x.TurfType})    
    )


        

    hot.loadData(rows_)

  },[selected_polygon]);


   return (
    isLoading=== false?
    <Fragment>
      <HotTable
        ref={hotRef}
        // rowHeaders={true}
        rowHeights={25}
        startRows = {3}
        startCols = {4}

        colHeaders={columns.map((x)=>x.header)}
        colWidths={columns.map((x)=>x.width)}
        columns = {columns.map((x)=>{return{data:x.name, readOnly: x.readOnly, type:x.type}})}
        // manualColumnResize={true}
        width={"100%"}
        stretchH= {'all'}
        // fixedColumnsStart={2}
        cells= {(row, column) => {

          var cellMeta = {};
          if (selected_polygon === null) return cellMeta;

          if(row < selected_polygon.properties.Labels.length) {

          if (column ==0) {
            cellMeta.type = 'dropdown';
            cellMeta.source = label_Level1_info
          }
          if (column ==1) {
            cellMeta.type = 'dropdown';    
            cellMeta.source = selected_polygon !== null? 
            label_Level2_info[label_Level1_info.findIndex((item) => item === selected_polygon.properties.Labels[row].level1)]:""
            }

          if (column ==2) {
            cellMeta.type = 'dropdown';
            cellMeta.source = turf_type
          }
        }

          return cellMeta;
        }
        }

        className = {'htCenter'}
        minSpareRows={0}
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only

        afterChange={(changes, source) => {
          changes?.forEach(([row, prop, oldValue, newValue]) => {

            if (selected_polygon === null) return

            let newPolygon = {...selected_polygon, 
              properties: {...selected_polygon.properties, Labels:hotRef.current.hotInstance.getSourceData()}};

            if(newPolygon.properties.Labels.slice(-1)[0].level1 !== '') newPolygon = {...selected_polygon, 
              properties: {...selected_polygon.properties, Labels:[...newPolygon.properties.Labels,label_single]}};


            setPolyGon({...newPolygon})

            if(newPolygon.properties.TypeId === 11){
              newPolygon = {...newPolygon,geometry: {...newPolygon.geometry, coordinates:newPolygon.properties.center, type:'Point'} }
            }   
            else{
              newPolygon = {...newPolygon,geometry: {...newPolygon.geometry, type:'Polygon'} }
            }


            let geojsoninfo_ = {...geojsoninfo, features: [...geojsoninfo.features.filter((x)=> x.properties.Id !== newPolygon.properties.Id), newPolygon]}

            setGeoJsonInfo({...geojsoninfo_})






            
          });
        }
      }          
      />

    </Fragment>
      :null     
  )
  }
