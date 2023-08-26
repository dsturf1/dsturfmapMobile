

import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Auth } from 'aws-amplify';

import { FormGroup, FormControlLabel, InputLabel, Stack, Select, MenuItem, Box, Checkbox,TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup, Autocomplete} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SendIcon from '@mui/icons-material/Send';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, SInfoContext, MapQContext} from "../../context"
import { COURSEBLANK , GEOJSONBLANK, POLYGONBLANK} from '../../constant/urlconstants';
import { label_Level1_info,  label_Level2_info, turf_type , label_single} from '../../constant/urlconstants';
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


export default function DSLabelHSTEdit({geojson_mode}) {
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
  const {geojsoninfo, setGeoJsonInfo,targetpolygons, setTargetPolygons, targetpoints, setTargetPoints, isLoading, setIsLoading} = useContext(MapQContext);
  const [newLabels, setNewLabels]  =useState(label_single);
  // const [localmode, setLocalMode] = useState(geojson_mode)

  const hotRef = useRef(null);
  const DescRef = useRef(null);

  const [columns, setCols] = useState([
    {name:'level1', header:'L1', type:'text', readOnly:false, width:60},
    {name:'level2', header:'L2', type:'text', readOnly:false, width:60},
    {name:'level3', header:'L3', type:'text', readOnly:false, width:60},
    {name:'TurfType', header:'TurfType', type:'text', readOnly:false, width:60},
  ]);
  
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
      level3:x.level2,
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
          width={"300px"}
          // stretchH= {'all'}
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
              cellMeta.source =  selected_polygon !== null? 
              label_Level2_info[label_Level1_info.findIndex((item) => item === selected_polygon.properties.Labels[row].level1)]:""
              }
            if (column ==3) {
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

              let geojsoninfo_ = {...geojsoninfo, features: [...geojsoninfo.features.filter((x)=> x.properties.Id !== newPolygon.properties.Id), newPolygon]}

              setGeoJsonInfo({...geojsoninfo_})

              if(newPolygon.properties.Labels.slice(-1)[0].level1 !== '') newPolygon = {...selected_polygon, 
                properties: {...selected_polygon.properties, Labels:[...newPolygon.properties.Labels,label_single]}};

              setPolyGon({...newPolygon})


              
            });
          }
        }          
        />

      </Fragment>
        :null

        
  )
  }
