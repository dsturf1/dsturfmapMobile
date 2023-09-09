import React, { createContext, useState, useEffect, useContext} from 'react';
import {BaseContext} from "./BaseData.js";
import {BASEURL} from "../constant/urlconstants.js";


import { course_list_label, captured_date_label } from '../constant/labelconstants';
import { Amplify, Auth , Storage } from 'aws-amplify';

export const LabelContext = createContext();

export const LabelProvider = (props) => {

  const [selected_capdate, setCapDate] = useState("");
  const [selected_labeljson, setSLabelJson] = useState([]);
  const [labeljson, setLabelJson] = useState([]);
  const [selected_singlelabel, setSSLabel] = useState({})
  const [imgURLs, setImgURLs] = useState([{src:"",desc:""}]);


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, 
    maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext); 


  
  useEffect(() => {

    if(selected_course === "MGC000"){
      setCapDate("");
      setSLabelJson([])
      setLabelJson([])
      setSSLabel({})
      setImgURLs([{src:"",desc:""}])
      return
    }

  },[selected_course]);


  useEffect(() => {
    console.log(selected_singlelabel)

  },[selected_singlelabel]);


  useEffect(() => {


    if (selected_course === "MGC000" || selected_capdate ==="") return
  
    async function getDataJson() {
      
      console.log("reading json:", selected_course + '/'+selected_capdate + '/photo.json')
      const result = await Storage.get(selected_course + '/'+selected_capdate +  '/photo.json',  { download: true , cacheControl: 'no-cache'});
      let datajson_ = await new Response(result.Body).json();
      // datajson_ = datajson_.map((json_)=> {
      //   let newjson = {}
      //   if (json_.label.length ===0) newjson = {...json_, label_flg: false}
      //   else newjson = {...json_, label_flg: true}
      // })
      setLabelJson([ ...datajson_])
    }
  getDataJson();
  // console.log("Loaded Json @DSLabelData",labeljson)

},[selected_capdate]);


useEffect(() => {

console.log("Loaded Json @DSLabelData",labeljson)

},[labeljson]);

useEffect(() => {

  console.log("Selected Json @DSLabelData",selected_labeljson)
  
  },[selected_labeljson]);



  return(

  <LabelContext.Provider  value={{labeljson, setLabelJson, selected_labeljson, setSLabelJson, imgURLs, setImgURLs, selected_singlelabel, setSSLabel, selected_capdate, setCapDate}}>
      {props.children}
  </LabelContext.Provider >
  
  );
}
