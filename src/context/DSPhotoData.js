import React, { createContext, useState, useEffect, useContext} from 'react';
import {BaseContext} from "./BaseData.js";
import {BASEURL} from "../constant/urlconstants.js";


import { photo_single } from '../constant/photoconstants.js';
import { Amplify, Auth , Storage } from 'aws-amplify';

export const PhotoContext = createContext();

export const PhotoProvider = (props) => {


  const [pr_photojson, setPrPhotoJson] = useState([]);
  const [ds_photojson, setDSPhotoJson] = useState([]);
  const [selected_photojson, setSPhotoJson] = useState(null)
  const [pr_imgURLs, setPrImgURLs] = useState([]);
  const [ds_imgURLs, setDSImgURLs] = useState([]);
  const [photo_loading, setPhotoLoading] = useState(false);


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, 
    maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon } = useContext(BaseContext); 


  
  useEffect(() => {


    // if (loginuser === "") return
    // if (Object.keys(baseinfo).length === 0) return
    // if (selected_mode !== 'Photo') return

    if(selected_course === "MGC000"){
      setPrPhotoJson([]);
      setDSPhotoJson([]);
      setSPhotoJson(null);
      setPrImgURLs([]);
      setDSImgURLs([]);

      return
    }


    async function getImgUrlSet(keyset) {
      const signedURL = await Promise.all(keyset.map(async (x, index_) => {
        return {
          id:x.id,
          desc:x.type,
          type:x.type,
          date:x.date,
          gps:x.gps,
          location:x.location,
          width:800,
          height:600,
          alt: '['+index_+']'+x.type,
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

    const fetchPrPhotoInfo = async(url_) => {

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
  


          const fetchData = await fetch(url_, myInit).then((response) => response.json())
          let  totaldatajson = []

          if(typeof fetchData.body !== 'undefined') totaldatajson = fetchData.body.sort((a, b) => a.id.localeCompare(b.id))

          

          
          
          return totaldatajson
          
      }
      catch (errors) {
            // errors.forEach((error) => console.error(error));
            console.log(errors)
      }
    }

    setPhotoLoading(true);
    fetchPrPhotoInfo(BASEURL + '/photo/' + baseinfo.user.username).then((totaldatajson)=>{

      setPrPhotoJson([ ...totaldatajson])
      console.log("Temp PhotoData", totaldatajson)

      let data2Url = totaldatajson.map(item => {return {
        id:item.id,
        type:item.info.type,
        gps:item.gps,
        location:item.location,
        date:item.date,
        rgb:item.imgsrc.replace(/\\/g, '/'), 
        ndvi:item.ndvisrc.replace(/\\/g, '/'), 
        thumb:item.thumbsrc.replace(/\\/g, '/')}
      })
  
      getImgUrlSet(data2Url).then((result) => {console.log("URL", result); setPrImgURLs([...result]);})
    });

    fetchPrPhotoInfo( BASEURL + '/photo?' + new URLSearchParams({courseid: selected_course.toString() })).then((totaldatajson)=>{

      setDSPhotoJson([ ...totaldatajson])
      console.log("DSDB PhotoData", totaldatajson)
      let data2Url = totaldatajson.map(item => {return {
        id:item.id,
        type:item.info.type,
        gps:item.gps,
        location:item.location,
        date:item.date,
        rgb:item.imgsrc.replace(/\\/g, '/'), 
        ndvi:item.ndvisrc.replace(/\\/g, '/'), 
        thumb:item.thumbsrc.replace(/\\/g, '/')}
      })
  
      getImgUrlSet(data2Url).then((result) => {console.log("URL", result); setDSImgURLs([...result]);})
    });

    setPhotoLoading(false)

},[selected_course]);


// useEffect(() => {

// console.log("Loaded Json @DSLabelData",labeljson, labeljson.filter((x)=> x.label.length !=0))

// },[labeljson]);

useEffect(() => {


  console.log("Selected PhotoData",selected_photojson)
  
},[selected_photojson]);

useEffect(() => {


  console.log("PhotoData",pr_imgURLs,pr_photojson)
  
},[pr_imgURLs,pr_photojson]);


  return(

  <PhotoContext.Provider  value={{pr_photojson, setPrPhotoJson, ds_photojson, setDSPhotoJson, selected_photojson, setSPhotoJson, 
    pr_imgURLs, setPrImgURLs, ds_imgURLs, setDSImgURLs,  photo_loading, setPhotoLoading}}>
      {props.children}
  </PhotoContext.Provider >
  
  );
}


