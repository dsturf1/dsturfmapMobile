import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Auth } from 'aws-amplify';

import { FormControl, InputLabel, Stack, Select, MenuItem, Box, TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import { green, pink ,indigo} from '@mui/material/colors';

import { BaseContext, SInfoContext, MapQContext} from "../../context"
import { COURSEBLANK , GEOJSONBLANK} from '../../constant/urlconstants';
import { BASEURL } from '../../constant/urlconstants.js';
import DSPolyHSTEdit from "../DSBasics/DSPolyHSTEdit"

import 'handsontable/dist/handsontable.full.min.css';
// import Handsontable from 'handsontable/base';
import { HotTable } from '@handsontable/react';
import numbro from 'numbro';
import languages from "numbro/dist/languages.min.js";
import { registerAllModules } from 'handsontable/registry';

registerAllModules();
numbro.registerLanguage(languages["ko-KR"]);


export function DSCourseNameInput({Hole_, name_, ref_, index_}){

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo} = useContext(BaseContext);
  const [textinput, setText] = useState(name_);


  return(
    <>
    <Stack direction="row" spacing={1}   justifyContent="space-between"  alignItems="center" mt = {1}>
      <Typography variant="caption"> 제 {Hole_} 코스명</Typography>
      <Input key ={"ds-course-name" + Hole_} name = {"ds-course-name" + Hole_} size="small" value={textinput} variant="filled" inputRef={ref_[index_]} Ref={ref_[index_]}
      onChange={(newValue) => {setText(newValue.target.value); newValue.preventDefault()} }
      onKeyPress= {(e) => {
        if (e.key === 'Enter') {
          if (ref_[index_+1]) ref_[index_+1].current.focus(); 
        }
      }}
      />
    </Stack>
    </>
  )
}


export default function DSInfoEdit({geojson_mode}) {

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
  const {geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading} = useContext(MapQContext);
  const [numHole, setNumHole] = React.useState(9);
  const Textrefs = useRef([]);

  const hotRef = useRef(null);
  const hotRef2 = useRef(null);

  // const [map_info_columns, setMapInfoCols] = useState([]);
  // const [course_names_columns, setCourseNamesCols] = useState([]);

  const map_info_columns = [
    {name:'title', header:'Item', width:100, type:'text', readOnly:true},
    {name:'lng', header:'Lonitude', width:80, editor: 'text', readOnly:true},
    {name:'lat', header:'Latitude', width:80, editor: 'text', readOnly:true}
  ]

  const course_names_columns = [
    {name:'title', header:'Course#', width:100, type:'text', readOnly:true},
    {name:'name', header:'Name', width:160, editor: 'text', readOnly:false},
  ]

  let course_names_data = [];
  let numHole_ = selected_course_info===null? 9:selected_course_info.numHole
  Array.from({length: parseInt(numHole_/9)}, (_, i) => i + 1).map((x, index) =>
    course_names_data.push({title:'제 '+x+' 코스명',name:selected_course_info=== null? "코스명" + x: selected_course_info.course_names[index]}) 
    )

  let map_info_data = [];
  map_info_data.push({title:'Zoom',lng:mapinfo.level, lat:null})
  map_info_data.push({title:'Center',lng:mapinfo.center[0].toFixed(5), lat:mapinfo.center[1].toFixed(5)})
  map_info_data.push({title:'SW Bds',lng:mapinfo.bounds.sw[0]? mapinfo.bounds.sw[0].toFixed(5):null, lat:mapinfo.bounds.sw[1]? mapinfo.bounds.sw[1].toFixed(8):null}) 
  map_info_data.push({title:'NE Bds',lng:mapinfo.bounds.ne[0]? mapinfo.bounds.ne[0].toFixed(5):null, lat:mapinfo.bounds.ne[1]? mapinfo.bounds.ne[1].toFixed(8):null}) 




  useEffect(() => {


  },[selected_course, selected_course_info]);

  useEffect(() => {


  },[mapinfo]);



  const handleAdd = () => { 

    if(selected_course_info === null) return


    let new_course_info = [
      ...baseinfo.course_info.filter((x)=> x.id !== selected_course_info.id),
      {...selected_course_info, map_info:mapinfo, course_names: [...selected_course_info.course_names]}
    ]

    let new_area_def = [...baseinfo.area_def]

    PostBaseInfo({area_def:new_area_def, course_info:new_course_info}).then(setBaseInfo({...baseinfo, course_info:new_course_info}));

    let geojsoninfo_ = {};

    if(selected_mode === "SearchSelected") geojsoninfo_ = {...JSON.parse(JSON.stringify(GEOJSONBLANK))}
    else geojsoninfo_ = {...geojsoninfo}

    // console.log("Saved Polgon:",  geojsoninfo_ )

    

    PostGeoJsonInfo(geojsoninfo_, selected_course_info.id);


  }

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
  
  const PostGeoJsonInfo = async function (mapinfo_, id_) 
  {
  
    const url_ = BASEURL + '/geojson/'+baseinfo.user.username +'?'+  new URLSearchParams({courseid: id_.toString() });
    const myInit = {
      method: 'POST',
      body: JSON.stringify( mapinfo_),
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
        console.log('At Post Map', fetchData)
        return fetchData
        } catch (err) { console.log('Workinfo Saving Error', err, url_); return err; }
   
  }

 
  return (
    <>
    {selected_course_info === null? null:

      <>
        <Button variant="contained"  fullWidth> {selected_course_info.name} </Button>

        <HotTable
          ref={hotRef}
          // rowHeaders={true}
          data = {map_info_data}
          rowHeights={25}
          startRows = {3}
          startCols = {2}
          width={"100%"}
          stretchH= {'all'}
          colHeaders={map_info_columns.map((x)=>x.header)}
          // colWidths={map_info_columns.map((x)=>x.width)}
          columns = {map_info_columns.map((x)=>{return{data:x.name, readOnly: x.readOnly, type:x.type}})}
          // mergeCells={[
          //   { row: 0, col: 1, rowspan: 1, colspan: 3 }
          // ]}
          // manualColumnResize={true}
          fixedColumnsStart={2}
          className = {'htCenter'}
          minSpareRows={0}
          licenseKey="non-commercial-and-evaluation" // for non-commercial use only          
        />

        <FormControl  size="small" fullWidth sx = {{ color: 'text.secondary', fontSize: 15 }} >
          <InputLabel id="ds-numhole-select-label">Num of Hole [홀수] </InputLabel>
          <Select
            labelId="ds-numhole-select-label"
            id="ds-numhole-select"
            value={selected_course_info.numHole}
            label="홀수"
            size="small"

            justifyContent="center"  alignItems="flex-start"
            onChange={(event) => {setSelectedCourseInfo({...selected_course_info, numHole:event.target.value})}}
          >
            {[9,18,27,36,45,54,63,72,81].map((x) =>  <MenuItem key={'Numhole'+x} value={x}>{x}</MenuItem>)}
          </Select>
        </FormControl>

        <HotTable
          ref={hotRef2}
          data = {course_names_data}
          // rowHeaders={true}
          rowHeights={25}
          startRows = {3}
          startCols = {2}
          width={"100%"}
          stretchH= {'all'}
          colHeaders={course_names_columns.map((x)=>x.header)}
          // colWidths={course_names_columns.map((x)=>x.width)}
          columns = {course_names_columns.map((x)=>{return{data:x.name, readOnly: x.readOnly, type:x.type}})}
          // mergeCells={[
          //   { row: 0, col: 1, rowspan: 1, colspan: 3 }
          // ]}
          // manualColumnResize={true}
          fixedColumnsStart={2}
          className = {'htCenter'}
          minSpareRows={0}
          licenseKey="non-commercial-and-evaluation" // for non-commercial use only          
          afterChange={(changes, source) => {
            changes?.forEach(([row, prop, oldValue, newValue]) => {
              // console.log(hotRef2.current.hotInstance.getSourceData().map((x)=>x.name))
              setSelectedCourseInfo({...selected_course_info, map_info:mapinfo, course_names: hotRef2.current.hotInstance.getSourceData().map((x)=>x.name)})

            });
          }}
        />
        <Stack direction="column" spacing={0}   justifyContent="space-between"  alignItems="center" mt = {0}>
          {selected_mode === "SearchSelected"? null:<DSPolyHSTEdit geojson_mode={geojson_mode}/>}

          <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={2}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
            <Button variant="outlined"  disabled = {selected_mode === "MAPGEOJSONEDIT"}
            onClick={() => {handleAdd();selected_mode === "SearchSelected"? setMode("CourseSearch"): setMode("MAPEdit")}}> Save</Button>
            <Button variant="outlined"  onClick={() => {selected_mode === "SearchSelected"? setMode("CourseSearch"): setMode("MAPSelect");setCourse("MGC000")}}> Cancel/Back</Button>
            {/* <Button variant="outlined"  onClick={() => {selected_mode === "SearchSelected"? setMode("CourseSearch"): setMode("MAPSelect");setCourse("MGC000")}}> Back</Button> */}
          </ButtonGroup>
        </Stack>
      </>
      }
    </>
  );
}