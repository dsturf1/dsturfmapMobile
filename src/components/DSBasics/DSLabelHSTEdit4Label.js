

import React, { useState,useRef, useEffect, useContext, Fragment ,createRef} from 'react';
import { Amplify, Auth , Storage } from 'aws-amplify';

import { FormGroup, FormControlLabel, InputLabel, Stack, Select, MenuItem, Box, Checkbox,TextField, Avatar, Paper, List, Input, Typography ,Button, ButtonGroup, Autocomplete} from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SendIcon from '@mui/icons-material/Send';
import { green, pink ,indigo, amber} from '@mui/material/colors';

import { BaseContext, MapQContext, MapCRSQContext, LabelContext} from "../../context"
import { COURSEBLANK , GEOJSONBLANK, POLYGONBLANK} from '../../constant/urlconstants';
// import { label_Level1_info,  label_Level2_info, turf_type , label_single} from '../../constant/urlconstants';
import {label_single} from '../../constant/labelconstants';
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
  const {labeljson, setLabelJson, selected_labeljson, setSLabelJson, imgURLs, setImgURLs, selected_singlelabel, setSSLabel, selected_capdate, setCapDate, selected_area_desc, setAreaDesc} = useContext(LabelContext);


  const [label_Level1_info, setL1]  =useState([]);
  const [label_Level2_info, setL2]  =useState([]);
  const [label_Level3_info, setL3]  =useState([]);
  const [turf_type, setTurfType]  =useState([]);
  // const [localmode, setLocalMode] = useState(geojson_mode)

  const hotRef = useRef(null);

  const columns = [
    {name:'level1', header:'L1', type:'text', readOnly:false, width:60},
    {name:'level2', header:'L2', type:'text', readOnly:false, width:60},
    {name:'level3', header:'L3', type:'text', readOnly:false, width:90},
    {name:'TurfType', header:'TurfType', type:'text', readOnly:false, width:60},
  ];
  
  useEffect(() => {

    if (hotRef.current === null) return;

    const hot = hotRef.current.hotInstance;
    // console.log(selected_singlelabel)
    
    if (Object.keys(selected_singlelabel).length === 0) {
      hot.loadData([label_single_blank])
      return
    }

    var rows_ = [];

    if(selected_singlelabel.label.length !==0 ) 
    selected_singlelabel.label.map((x) => rows_.push({
      level1:x.level1,
      level2:x.level2,
      level3:x.level3,
      TurfType:x.TurfType})    
    ) 
    else rows_.push(label_single_blank)       

    hot.loadData(rows_)

  },[selected_singlelabel]);

  useEffect(() => {
    if(Object.keys(baseinfo).length ===0) return

    console.log("Label level 3 is", label_Level3_info)


  },[label_Level3_info]);



  useEffect(() => {
    if(Object.keys(baseinfo).length ===0) return

    let L1 = [...new Set(baseinfo.label_info.map(item => item.L1))]
    let L2 = []
    let L3 = []
    let tmp = []

    tmp = L1.map((level_) => baseinfo.label_info.filter(item => item.L1 === level_).map(x=>x.L2))

    tmp.forEach((L2_)=>
    {
      // console.log(L2_,[...new Set(L2_)])
      L2.push([...new Set(L2_)])
    })

    tmp = [...new Set(baseinfo.label_info.map(item => item.L2))]

    let L3_tmp = tmp.map((level_) => baseinfo.label_info.filter(item => item.L2 === level_).map(x=>x.L3))

    L3_tmp.forEach((L3_)=>
    {
      console.log(L3_,[...new Set(L3_)])
      L3.push([...new Set(L3_)])
    })
    let turf_ = [...new Set(baseinfo.turf_type.map(item => item.turf_type))]


    setL1([...L1])
    setL2([...L2])
    setL3([...L3])
    setTurfType([...turf_])


    console.log("Labeliis", L1,L2,L3,turf_)


  },[baseinfo]);


  const PostLabelSingle = async function (labelJson_) 
  {

    const url_ = BASEURL + '/label/'+selected_course +'?'
    const myInit = {
      method: 'POST',
      body: JSON.stringify( labelJson_),
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
        } catch (err) { 
          console.log('LabelInfo Saving Error', err, url_); 
          alert('저장에 실했읍니다.')
          return err; 
      
      }
 
  }

  const PostLabelMulti =  async(labelJson_) => {

    try {

        const url_ = BASEURL + '/label/'+selected_course +'?'

        const Inits = labelJson_.map(async (label_) => {return {
            method: 'POST',
            body: JSON.stringify( label_),
            headers: {
              Authorization: `Bearer ${(await Auth.currentSession())
                .getIdToken()
                .getJwtToken()}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          };
        
        })

        const InitswithAuth = await Promise.all(Inits);
        // console.log(urls)
        const requests = InitswithAuth.map((x) => fetch(url_, x));

        const responses = await Promise.all(requests);
        const errors = responses.filter((response) => !response.ok);
    
        if (errors.length > 0) {
          throw errors.map((response) => Error(response.statusText));
        }
    
        const json = responses.map((response) => response.json());
        const data = await Promise.all(json);
        alert('저장에 성공했습니다..')
    }
    catch (errors) {
          errors.forEach((error) => console.error(error));
          alert('저장에 실했읍니다.')
    }
    }

    const fetchLabelInfoAll = async() => {

      try {
        const url_ = BASEURL + '/label/'+selected_course +'?'+  new URLSearchParams({date: selected_capdate})
        const myInit = {
          method: 'GET',
          // body: '',
          headers: {
            Authorization: `Bearer ${(await Auth.currentSession())
              .getIdToken()
              .getJwtToken()}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        };

        const fetchData = await fetch(url_, myInit).then((response) => response.json())
        return fetchData
      }
      catch (errors) {
            errors.forEach((error) => console.error(error));
      }    
    
  
    }

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
                label_Level3_info[[...new Set(baseinfo.label_info.map(item => item.L2))].findIndex((item) => item === selected_singlelabel.label[row].level2)]:""
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

                // if (Object.keys(labeljson).length === 0) return

                console.log("UPdated Label Single", hotRef.current.hotInstance.getSourceData())

                let newLabel = {...selected_singlelabel, label:hotRef.current.hotInstance.getSourceData()}

                if(newLabel.label.slice(-1)[0].level1 !== '') newLabel = {...newLabel, label:[...newLabel.label, label_single], labelBy:loginuser}

                // console.log(selected_singlelabel.label.slice(-1)[0].level1)

                setSSLabel({...newLabel})
                // console.log(newLabel.label.slice(0,-1))
                if(newLabel.label.slice(-1)[0].level1 === '') newLabel = {...newLabel, label:[...newLabel.label.slice(0,-1)], labelBy:loginuser}
                setLabelJson([...labeljson.filter((x) => x.id !== newLabel.id), {...newLabel}])

                // setSSLabel({...newLabel})
                let saveJson = {
                    id: newLabel.id,
                    metadata:selected_course+newLabel.info.date+newLabel.info.area+newLabel.info.desc,
                    courseid:selected_course,
                    date :newLabel.info.date,
                    area:newLabel.info.area,
                    desc:newLabel.info.desc,
                    json:{...newLabel}
                }

                PostLabelSingle(saveJson)
                return
          })
        }}          
        />
        <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={0}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
          <Button variant= "contained"  sx={{ width: 1/3}} onClick={() => {
            if (Object.keys(selected_singlelabel).length === 0) return

            let newLabel = {...selected_singlelabel, label:[...selected_singlelabel.label.slice(0, -1)], labelBy:loginuser}
            setSSLabel({...newLabel})
            setLabelJson([...labeljson.filter((x) => x.id !== newLabel.id), {...newLabel}])

            let saveJson = {
              id: newLabel.id,
              metadata:selected_course+newLabel.info.date+newLabel.info.area+newLabel.info.desc,
              courseid:selected_course,
              date :newLabel.info.date,
              area:newLabel.info.area,
              desc:newLabel.info.desc,
              json:{...newLabel}
            }

            PostLabelSingle(saveJson)

          }}> 지우기 </Button>
          

          <Button variant= "contained"  sx={{ width: 2/3}} disabled = {selected_labeljson.length===0} onClick={() => {
            if (Object.keys(selected_singlelabel).length === 0) return

            if(window.confirm('정말로 덮어쓸까요?')){
              // let single_ = [...selected_singlelabel.label]
              // single_ = 
              let newJason_ = selected_labeljson.map((label_) => {return {...label_ , label:[...selected_singlelabel.label.filter((x)=> x.level1 !== '')] , labelBy:loginuser}})
              setSLabelJson([...newJason_])
              setLabelJson([...labeljson.map(obj => newJason_ .find(o => o.id === obj.id) || obj)]);

              let saveJson = newJason_.map((row_)=>{return{
                id: row_.id,
                metadata:selected_course+row_.info.date+row_.info.area+row_.info.desc,
                courseid:selected_course,
                date :row_.info.date,
                area:row_.info.area,
                desc:row_.info.desc,
                json:row_
            }})

            console.log(saveJson)
            PostLabelMulti(saveJson)
            }


          }}> 선택된 사진들에 라벨적용</Button>
        </ButtonGroup>
        <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={0}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
          <Button variant= "outlined"  sx={{ width: 1/2}} onClick={() => {
            //   if (Object.keys(selected_singlelabel).length === 0) return
            var currentdate = new Date(); 
            const fileName = baseinfo.course_info.filter((x) => x.id === selected_course)[0].name +'_' + selected_capdate +'_' + selected_area_desc.map((x, i_)=>x.area +'['+ x.desc+']').join('_') +  '_label'
            +'_' +currentdate.toISOString().slice(5, 10).replace('-','')+'.json'
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
            //   if (Object.keys(selected_singlelabel).length === 0) return


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
                  ...labels,
                  labelBy:x.labelBy
                })
              });

              console.log(allData)

              const ws = utils.json_to_sheet(allData);
              const wb = utils.book_new();
          
              // var filename = baseinfo.course_info.filter((x)=>x.dscourseids === selected_course).length>0? 
              //   baseinfo.course_info.filter((x)=>x.dscourseids === selected_course)[0].name:"Noname"
              var currentdate = new Date(); 
              const fileName = baseinfo.course_info.filter((x) => x.id === selected_course)[0].name + selected_capdate +  '_label'
              + currentdate.toISOString().slice(5, 10)
          
              utils.book_append_sheet(wb, ws, fileName);
              writeFileXLSX(wb, fileName + '.xlsx');


            }}> 라벨 Excel Download</Button>
        </ButtonGroup>
        {/* <Button variant= "outlined"  sx={{ width: 1}} onClick={() => {
            //   if (Object.keys(selected_singlelabel).length === 0) return

            fetchLabelInfoAll().then((result) => console.log(result))

            }}> All 라벨 Json Download</Button> */}

      </Fragment>        
  )
  }
