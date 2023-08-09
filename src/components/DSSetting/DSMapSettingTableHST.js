import React, { useState, useEffect, useContext , useRef, useCallback} from 'react';
import { BaseContext, WorkContext, PlanContext } from "../../context"
import { Box, Stack , Button, TextField,Dialog,DialogActions,DialogContent, DialogContentText, DialogTitle, MenuItem, Autocomplete} from '@mui/material';

import 'handsontable/dist/handsontable.full.min.css';
// import Handsontable from 'handsontable/base';
import { HotTable } from '@handsontable/react';
import numbro from 'numbro';
import languages from "numbro/dist/languages.min.js";
import { registerAllModules } from 'handsontable/registry';

registerAllModules();
numbro.registerLanguage(languages["ko-KR"]);

export default function DSMapSettingTableHST({selected_menu}) {

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo} = useContext(BaseContext);
  // const {baseinfo, setBaseInfo} = useContext(BaseContext);
  const hotRef = useRef(null);
 

  const columns_list = {
    area_def:
      [
        { name: 'TypeId', header: 'ID',align:"center", width:100,type: 'text'},
        { name: 'name', header: '구역명',align:"center", width:150,type: 'text'},
        { name: 'color', header: '색상',align:"center", width:80,type: 'text'},
        { name: 'DSZindex', header: 'z-index',align:"center", width:100,type: 'numeric'},
        { name: 'display', header: '사용여부 초기값',align:"center", width:80, type: 'dropdown',  source: [true, false] },
      ],
    }

  let columns = columns_list[selected_menu.key_id]

   useEffect(() => {
      // const hot = hotRef.current.hotInstance;
      if(typeof baseinfo.area_def !== 'undefined' && baseinfo.area_def.length > 0)      {
        
        const hot = hotRef.current.hotInstance;
        hot.loadData(baseinfo[selected_menu.key_id])
        columns = columns_list[selected_menu.key_id]
        // setEdited(false)

        console.log(Math.max(...baseinfo.area_def.map((x)=> Number(x.TypeId))).toString())

      }    
  },[baseinfo, selected_menu]);





  return (
    <Box height="90vh" sx={{ p: 1, border: '1px solid grey',gap: 2, borderRadius: 2 , m: 1, overflow: 'hidden'}}>
      <Button variant= {"outlined"}  onClick={() => {

        let newID = Math.max(...baseinfo.area_def.map((x)=> Number(x.TypeId)))+1;
        let newZindex = Math.max(...baseinfo.area_def.map((x)=> Number(x.DSZindex))) + 1
        setBaseInfo({...baseinfo, area_def:[...baseinfo.area_def, {
    "TypeId": newID.toString(),
    "name": "",
    "color": "",
    "display": true,
    "DSZindex": newZindex
  }]})
  
  setEdited(true);
  }}> 신규 생성</Button>
      <HotTable
        ref={hotRef}
        rowHeaders={true}
        rowHeights={30}
        manualRowResize={true}
        startRows = {10}
        startCols = {10}

        colHeaders={columns.map((x)=>x.header)}
        colWidths={columns.map((x)=>x.width)}
        columns = {columns.map((x)=>{return{data:x.name, readOnly: false, type:x.type, source: x.type === 'dropdown'? x.source:null}})}
        manualColumnResize={true}

        className = {'htMiddle'}
        height="89vh"
        filters={true}
        dropdownMenu={true}
        minSpareRows={0}
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only

        // afterChange={(x, source) =>{if(typeof x === 'undefined' && x.length>0) console.log({...rows[x[0]],[x[1]]:x[4]})}}
        afterChange={(changes, source) => {
          changes?.forEach(([row, prop, oldValue, newValue]) => {
            console.log({[selected_menu.key_id]:hotRef.current.hotInstance.getSourceData()})
            setBaseInfo({...baseinfo,
              [selected_menu.key_id]: hotRef.current.hotInstance.getSourceData()})
          });
          setEdited(true);
        }}
        
      />
    </Box>
  )
}