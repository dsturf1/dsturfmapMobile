import React, { createContext, useState, useEffect, useContext} from 'react';
import {BaseContext} from "./BaseData.js";
import {BASEURL} from "../constant/urlconstants.js";


import { course_list_label, captured_date_label } from '../constant/labelconstants';
import { Amplify, Auth , Storage } from 'aws-amplify';

export const LabelContext = createContext();

export const LabelProvider = (props) => {

  const [selected_capdate, setCapDate] = useState("");
  const [selected_area_desc, setAreaDesc] = useState([]);
  const [selected_labeljson, setSLabelJson] = useState([]);
  const [labeljson, setLabelJson] = useState([]);
  const [selected_singlelabel, setSSLabel] = useState({})
  const [imgURLs, setImgURLs] = useState([{src:"",desc:""}]);
  const [label_loading, setLabelLoading] = useState(false);


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, 
    maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon } = useContext(BaseContext); 


  
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
    if (selected_area_desc.length ===0) return

    async function getImgUrlSet(keyset) {
      const signedURL = await Promise.all(keyset.map(async (x, index_) => {
        return {
          id:x.id,
          desc:x.desc,
          width:800,
          height:600,
          alt: '['+index_+']'+x.desc,
          src:await Storage.get(x.rgb, {
            // validateObjectExistence: true 
            expires:3600
          }), 
          rgb:await Storage.get(x.rgb, {
            // validateObjectExistence: true 
            expires:3600
          }), 
          thumb:await Storage.get(x.thumb, {
            // validateObjectExistence: true 
            expires:3600
          }),  
          ndvi:await Storage.get(x.ndvi, {
            // validateObjectExistence: true 
            expires:3600
          }), 
        }
      }))
      return signedURL
    } 

    
    const fetchLabelInfo = async() => {

      try {
  
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
  

          let totaldatajson = []

          const urls = selected_area_desc.map((area_desc_) => BASEURL + '/label/'+selected_course +'?'+  new URLSearchParams({date: selected_capdate, 
            area:area_desc_.area, desc:area_desc_.desc}))
          
          // console.log(urls)
          const requests = urls.map((url) => fetch(url, myInit));

          const responses = await Promise.all(requests);
          const errors = responses.filter((response) => !response.ok);
      
          if (errors.length > 0) {
            throw errors.map((response) => Error(response.statusText));
          }
      
          const json = responses.map((response) => response.json());
          const data = await Promise.all(json);

          data.forEach((datum) => {
            let new_ = datum.body.map((x)=> {
              if (x.hasOwnProperty("labelBy")) return x.json
              else return {...x.json, labelBy:loginuser}
            })
            totaldatajson = [...totaldatajson, ...new_]
          });



          setLabelJson([ ...totaldatajson.sort((a, b) => 
            a.GeoTagInfo.coords[0] + a.GeoTagInfo.coords[1] - b.GeoTagInfo.coords[0] - b.GeoTagInfo.coords[1] ||
            Number(a.id.split('_')[0]) - Number(b.id.split('_')[0]) || 
            a.GeoTagInfo.gps_altitude - b.GeoTagInfo.gps_altitude
            
            )])

          // setLabelJson([ ...totaldatajson])


          // console.log(totaldatajson, data)

          let data2Url = totaldatajson.filter((x) => x.dest.thumb !== '').map(item => {return {
              id:item.id,
              desc:item.info.desc,
              rgb:item.dest.rgb.replace(/\\/g, '/'), 
              ndvi:item.dest.ndvi.replace(/\\/g, '/'), 
              thumb:item.dest.thumb.replace(/\\/g, '/')}
            })
        
          getImgUrlSet(data2Url).then((result) => {console.log("URL", result); setImgURLs([...result]);setLabelLoading(false)})
      }
      catch (errors) {
            // errors.forEach((error) => console.error(error));
            console.log(errors)
            alert('Loading이 안되네요! 다른 폴더 먼저 해보세요!!')
      }



            
            // setLabelJson([ ...totaldatajson])

            // // setLabelJson([ ...fetchData.body])
  
  

      }
  
    setLabelLoading(true)
    fetchLabelInfo();

},[selected_capdate, selected_area_desc]);


useEffect(() => {

console.log("Loaded Json @DSLabelData",labeljson)

},[labeljson]);

useEffect(() => {


  console.log("Selected Json @DSLabelData",selected_labeljson)
  if(selected_labeljson.length > 0)
  console.log("Selected Json @DSLabelData",selected_labeljson[0].id.split('_')[0])
  
},[selected_labeljson]);



  return(

  <LabelContext.Provider  value={{labeljson, setLabelJson, selected_labeljson, setSLabelJson, imgURLs, setImgURLs, 
  selected_singlelabel, setSSLabel, selected_capdate, setCapDate,  selected_area_desc, setAreaDesc,label_loading, setLabelLoading}}>
      {props.children}
  </LabelContext.Provider >
  
  );
}
