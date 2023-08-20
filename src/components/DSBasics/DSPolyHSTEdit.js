

import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Auth } from 'aws-amplify';

import { FormGroup, FormControlLabel, InputLabel, Stack, Select, MenuItem, Box, Checkbox,TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SendIcon from '@mui/icons-material/Send';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, SInfoContext, MapQContext} from "../../context"
import { COURSEBLANK , GEOJSONBLANK, POLYGONBLANK} from '../../constant/urlconstants';
import { BASEURL } from '../../constant/urlconstants.js';


import 'handsontable/dist/handsontable.full.min.css';
// import Handsontable from 'handsontable/base';
import { HotTable } from '@handsontable/react';
import numbro from 'numbro';
import languages from "numbro/dist/languages.min.js";
import { registerAllModules } from 'handsontable/registry';
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, area } from "@turf/turf";

registerAllModules();
numbro.registerLanguage(languages["ko-KR"]);


export default function DSPolyHSTEdit({geojson_mode}) {
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
  const {geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading} = useContext(MapQContext);
  // const [localmode, setLocalMode] = useState(geojson_mode)

  const hotRef = useRef(null);
  const DescRef = useRef(null);

  const [columns, setCols] = useState([
    {name:'title', header:'항목', width:100, type:'text', readOnly:true},
    {name:'name', header:'값', width:160, editor: 'text', readOnly:false}
  ]);
  
  useEffect(() => {

    if (isLoading||  selected_course_info === null) return

    var rows_ = [];

    let turfpolygon_ = {}
    
    // if (selected_polygon !== null) turfpolygon_ = turfpolygon([[...selected_polygon['geometry']['coordinates'][0], selected_polygon['geometry']['coordinates'][0][0]]])

    rows_.push({title:'코스명',name:selected_polygon === null? "":selected_polygon.properties.Course})    
    rows_.push({title:'Type',name:selected_polygon === null? "":selected_polygon.properties.Type})    
    rows_.push({title:'홀',name:selected_polygon === null? "":selected_polygon.properties.Hole})
    rows_.push({title:'면적',name:selected_polygon === null? "":area(selected_polygon).toFixed(1).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")})

    rows_.push({title:'작성자',name:selected_polygon === null? "":selected_polygon.properties.By})
    rows_.push({title:'작성시점',name:selected_polygon === null? "":selected_polygon.properties.When.split('T')[0]})
    rows_.push({title:'Valid?',name:selected_polygon === null? "":selected_polygon.properties.Valid})
    rows_.push({title:'반지름(m)',name:selected_polygon === null? 0:selected_polygon.properties.radius})
    // rows_.push({title:'개요',name:selected_polygon === null? "":selected_polygon.properties.Desc})

    if(DescRef !== null) DescRef.current.value = selected_polygon === null? "":selected_polygon.properties.Desc
    const hot = hotRef.current.hotInstance;

    // console.log("@InfoEdit", selected_polygon)

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
            
            if (row === 0) {
              cellMeta.type = 'dropdown';
              cellMeta.source = selected_course_info !== null?[...selected_course_info.course_names, "전코스"]:null
            }
            if (row === 1) {
              cellMeta.type = 'dropdown';
              // cellMeta.source = baseinfo.area_def.map((x)=>x.name)
              cellMeta.source = geojson_mode === "AREA"? baseinfo.area_def.filter((item)=> item.area_def === true).map((x)=>x.name):baseinfo.area_def.filter((item)=> item.work_def === true).map((x)=>x.name)
            }
            if (row === 2) {
              cellMeta.type = 'dropdown';
              cellMeta.source = [1,2,3,4,5,6,7,8,9]
            }
            if (row === 6) {
              cellMeta.type = 'dropdown';
              cellMeta.source = [true,false]
            }
            if (row === 7) {
              cellMeta.type = 'dropdown';
              cellMeta.source = [1,1.5,2,2.5,3,3.5,4,5,7.5,10,15,20, 50]
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
              // console.log(row, newValue);

              if (selected_polygon === null) return

              let newPolygon = {...selected_polygon};

              if (row === 0) newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, Course:newValue}}  
              if (row === 1) {
                let TypeId_list = baseinfo.area_def.filter((x)=> x.name === newValue);
                let TypeId_ = TypeId_list.length>0? TypeId_list[0].TypeId:0
                newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, Type:newValue,  TypeId:TypeId_}}   
                // console.log(newPolygon)
              }
              if (row === 2) newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, Hole:newValue}}  
              if (row === 6) newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, Valid:newValue}}  
              if (row === 7) newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, radius:Number(newValue)}} 

              setPolyGon({...newPolygon})

              if(newPolygon.properties.TypeId === 11){
                newPolygon = {...newPolygon,geometry: {...newPolygon.geometry, coordinates:newPolygon.properties.center, type:'Point'} }
              }     



              let geojsoninfo_ = {...geojsoninfo, features: [...geojsoninfo.features.filter((x)=> x.properties.Id !== newPolygon.properties.Id), newPolygon]}

              setGeoJsonInfo({...geojsoninfo_})


              
            });
          }}
          
        />
        {/* <Stack direction="column" spacing={0}   justifyContent="space-between"  alignItems="center" mt = {0}> */}
          <TextField
            id="outlined-multiline-static"
            label="특이사항"
            multiline
            rows={2}
            placeholder='샘지기에게 설명을...'
            inputRef={DescRef}
            fullWidth
            disabled = {selected_polygon === null}
          />
          <Button
            variant='contained'
            color='primary'
            size='small'
            // endIcon={<SendIcon />}
            onClick={()=>{
              if(selected_polygon === null) return
              let newPolygon = {...selected_polygon, properties: {...selected_polygon.properties, Desc:DescRef.current.value}}            
              setPolyGon({...newPolygon})


              if(newPolygon.properties.TypeId === 11){
                newPolygon = {...newPolygon,geometry: {...newPolygon.geometry, coordinates:newPolygon.properties.center, type:'Point'} }
              }     


              let geojsoninfo_ = {...geojsoninfo, features: [...geojsoninfo.features.filter((x)=> x.properties.Id !== newPolygon.properties.Id), newPolygon]}
              setGeoJsonInfo({...geojsoninfo_})
            }}
            fullWidth
            disabled = {selected_polygon === null}
            >
            특이사항 Update
          </Button>



        <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={0}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
          <Button variant= {selected_mode === "MAPEdit"? "outlined":"contained"}  onClick={() => {selected_mode === "MAPEdit"? setMode("MAPGEOJSONEDIT"):setMode("MAPEdit")}}> 
          {geojson_mode === "JOBS"? 
            (selected_mode === "MAPEdit" && selected_polygon === null? "신규관심지역 생성":(selected_mode === "MAPEdit" && selected_polygon !== null? "선택된지역수정":"신규/수정모드 종료"))
            :
            (selected_mode === "MAPEdit" ? "신규/수정모드":"신규/수정모드 종료")          
          }</Button>
        </ButtonGroup>
        {/* </Stack> */}
      </Fragment>
        :null

        
  )
  }
