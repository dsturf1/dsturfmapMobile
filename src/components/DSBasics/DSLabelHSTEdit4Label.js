

import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Amplify, Auth , Storage } from 'aws-amplify';

import { FormGroup, FormControlLabel, InputLabel, Stack, Select, MenuItem, Box, Checkbox,TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup, Autocomplete} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SendIcon from '@mui/icons-material/Send';
import { green, pink ,indigo, amber} from '@mui/material/colors';

import { BaseContext, MapQContext, MapCRSQContext, LabelContext} from "../../context"
import { COURSEBLANK , GEOJSONBLANK, POLYGONBLANK} from '../../constant/urlconstants';
// import { label_Level1_info,  label_Level2_info, turf_type , label_single} from '../../constant/urlconstants';
import { label_Level1_info,  label_Level2_info, turf_type , label_single} from '../../constant/labelconstants';
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
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
  const {labeljson, setLabelJson, selected_labeljson, setSLabelJson, imgURLs, setImgURLs, selected_singlelabel, setSSLabel, selected_capdate, setCapDate} = useContext(LabelContext);

  const [newGRPlabel, setNewGRPLabels]  =useState([label_single_blank]);
  // const [localmode, setLocalMode] = useState(geojson_mode)

  const hotRef = useRef(null);

  const columns = [
    {name:'level1', header:'L1', type:'text', readOnly:false, width:60},
    {name:'level2', header:'L2', type:'text', readOnly:false, width:60},
    {name:'level3', header:'L3', type:'text', readOnly:false, width:60},
    {name:'TurfType', header:'TurfType', type:'text', readOnly:false, width:60},
  ];
  
  useEffect(() => {

    if (hotRef.current === null) return;

    const hot = hotRef.current.hotInstance;
    console.log(selected_singlelabel)
    
    if (Object.keys(selected_singlelabel).length === 0) {
      hot.loadData([label_single_blank])
      return
    }

    var rows_ = [];

    if(selected_singlelabel.label.length !==0 ) 
    selected_singlelabel.label.map((x) => rows_.push({
      level1:x.level1,
      level2:x.level2,
      level3:x.level2,
      TurfType:x.TurfType})    
    ) 
    else rows_.push(label_single_blank)       

    hot.loadData(rows_)

  },[selected_singlelabel]);


  // useEffect(() => {

  //   if (hotRef.current === null) return;
  //   if (selected_mode !== 'GRPLABEL') return

  //   const hot = hotRef.current.hotInstance;
  //   console.log("JSONs @GRP",selected_labeljson)
  //   setNewGRPLabels([{...label_single_blank}])

  //   hot.loadData([ JSON.parse(JSON.stringify(label_single))])

  // },[selected_labeljson, selected_mode]);



  return (
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

            // if(selected_mode === 'GRPLABEL'){
            //   cellMeta = {};
            //   if(row < newGRPlabel.length) {// 왜 넣었을까

            //     if (column ==0) {
            //       cellMeta.type = 'dropdown';
            //       cellMeta.source = label_Level1_info
            //     }
            //     if (column ==1) {
            //       cellMeta.type = 'dropdown';    
            //       cellMeta.source = newGRPlabel.length !== 0? 
            //       label_Level2_info[label_Level1_info.findIndex((item) => item === newGRPlabel[row].level1)]:""
            //       }
            //     if (column ==2) {
            //       cellMeta.type = 'dropdown';
            //       cellMeta.source = newGRPlabel.length !== 0? 
            //       label_Level2_info[label_Level1_info.findIndex((item) => item === newGRPlabel[row].level1)]:""
            //       }
            //     if (column ==3) {
            //       cellMeta.type = 'dropdown';
            //       cellMeta.source = turf_type
            //     }
            //   }
            //   return cellMeta;
            // }
            // if(selected_mode === 'INDLABEL'){

            // cellMeta = {};
            if (Object.keys(selected_singlelabel).length === 0) return cellMeta;


            if(row < selected_singlelabel.label.length) {// 왜 넣었을까

              if (column ==0) {
                cellMeta.type = 'dropdown';
                cellMeta.source = label_Level1_info
              }
              if (column ==1) {
                cellMeta.type = 'dropdown';    
                cellMeta.source = Object.keys(selected_singlelabel).length !== 0? 
                label_Level2_info[label_Level1_info.findIndex((item) => item === selected_singlelabel.label[row].level1)]:""
                }
              if (column ==2) {
                cellMeta.type = 'dropdown';
                cellMeta.source = Object.keys(selected_singlelabel).length !== 0? 
                label_Level2_info[label_Level1_info.findIndex((item) => item === selected_singlelabel.label[row].level1)]:""
                }
              if (column ==3) {
                cellMeta.type = 'dropdown';
                cellMeta.source = turf_type
              }
            }

            return cellMeta;
            // }
            // return {};
          }
          }

          className = {'htCenter'}
          minSpareRows={0}
          licenseKey="non-commercial-and-evaluation" // for non-commercial use only

          afterChange={(changes, source) => {
            changes?.forEach(([row, prop, oldValue, newValue]) => {

                if (Object.keys(selected_singlelabel).length === 0) return

                console.log("UPdated Label Single", hotRef.current.hotInstance.getSourceData())

                let newLabel = {...selected_singlelabel, label:hotRef.current.hotInstance.getSourceData()}

                if(newLabel.label.slice(-1)[0].level1 !== '') newLabel = {...newLabel, label:[...newLabel.label, label_single]}

                // console.log(selected_singlelabel.label.slice(-1)[0].level1)

                setSSLabel({...newLabel})
                // console.log(newLabel.label.slice(0,-1))
                if(newLabel.label.slice(-1)[0].level1 === '') newLabel = {...newLabel, label:[...newLabel.label.slice(0,-1)]}
                setSLabelJson([...selected_labeljson.filter((x) => x.id !== newLabel.id), {...newLabel}])

                // setSSLabel({...newLabel})
                return
          })
        }}          
        />
        <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={0}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
          <Button variant= "contained"  sx={{ width: 1/4}} onClick={() => {
            if (Object.keys(selected_singlelabel).length === 0) return

            let newLabel = {...selected_singlelabel, label:[label_single_blank]}
            setSSLabel({...newLabel})
            setSLabelJson([...selected_labeljson.filter((x) => x.id !== newLabel.id), {...newLabel}])

          }}> 지우기 </Button>
          <Button variant= "contained"  sx={{ width: 1/4}} onClick={() => {
            if (Object.keys(selected_singlelabel).length === 0) return



            if(window.confirm('정말로 저장?')){
              setLabelJson([...labeljson.map(obj => selected_labeljson.find(o => o.id === obj.id) || obj)]);
              // Storage.put(selected_course + '/'+selected_capdate +  '/data.json', 
              // JSON.stringify([...labeljson.map(obj => selected_labeljson.find(o => o.id === obj.id) || obj)]) ,
              //   { cacheControl: 'no-cache'}
              //   ).then(async function(result) {console.log(`result : ${JSON.stringify(result)}`);})
              Storage.copy({ key: selected_course + '/'+selected_capdate +  '/photo.json' }, { key: selected_course + '/'+selected_capdate +  '/photo'+(new Date().toJSON().slice(0,10))+'.json' })
                .then(async function(result) {
                  console.log(`result : ${JSON.stringify(result)}`);
                  Storage.put(selected_course + '/'+selected_capdate +  '/photo.json', 
                  JSON.stringify([...labeljson.map(obj => selected_labeljson.find(o => o.id === obj.id) || obj)]) ,
                  { cacheControl: 'no-cache'})
                    .then(async function(result) {console.log(`result : ${JSON.stringify(result)}`);})           
            
                })
            }

          }}> 저장하기 </Button>
          <Button variant= "contained"  sx={{ width: 2/4}} onClick={() => {
            if (Object.keys(selected_singlelabel).length === 0) return

            if(window.confirm('정말로 전체 그룹사진에 덮어쓸까요?')){
              // let single_ = [...selected_singlelabel.label]
              // single_ = 
              let newJason_ = selected_labeljson.map((label_) => {return {...label_ , label:[...selected_singlelabel.label.filter((x)=> x.level1 !== '')]}})
              setSLabelJson([...newJason_])
            }


          }}> 전체 그룹사진라벨 설정</Button>
        </ButtonGroup>
        <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={0}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
          <Button variant= "outlined"  sx={{ width: 1/2}} onClick={() => {
              if (Object.keys(selected_singlelabel).length === 0) return

              const fileName = baseinfo.course_info.filter((x) => x.id === selected_course)[0].name + selected_capdate +  '_label.json'
              const data = new Blob([JSON.stringify(labeljson)], { type: "text/json" });
              const jsonURL = window.URL.createObjectURL(data);
              const link = document.createElement("a");
              document.body.appendChild(link);
              link.href = jsonURL;
              link.setAttribute("download", fileName);
              link.click();
              document.body.removeChild(link);


            }}> 라벨 Json Download</Button>
          <Button variant= "outlined" sx={{ width: 1/2}} onClick={() => {
              if (Object.keys(selected_singlelabel).length === 0) return


              var allData = [];

              labeljson.forEach(x => { 
                let labels = x.label.map((x,i)=>{return {
                  ['level1_'+i]:x.level1,
                  ['level2_'+i]:x.level2,
                  ['level3_'+i]:x.level3,
                  ['turf_type_'+i]:x.turf_type        
                
                }}).reduce(function(result, current) {
                  return Object.assign(result, current);
                }, {})
                allData.push({
                  filename_org:x.originalFileJPG,
                  date:x.info.date,
                  desc:x.info.dec,
                  desc:x.info.dec,
                  course:x.info.course,
                  area:x.info.area,
                  ...labels
                })
              });

              console.log(allData)

              const ws = utils.json_to_sheet(allData);
              const wb = utils.book_new();
          
              // var filename = baseinfo.course_info.filter((x)=>x.dscourseids === selected_course).length>0? 
              //   baseinfo.course_info.filter((x)=>x.dscourseids === selected_course)[0].name:"Noname"

              const fileName = baseinfo.course_info.filter((x) => x.id === selected_course)[0].name + selected_capdate +  '_label'
          
              utils.book_append_sheet(wb, ws, fileName);
              writeFileXLSX(wb, fileName + '.xlsx');


            }}> 라벨 Excel Download</Button>
        </ButtonGroup>


      </Fragment>        
  )
  }
