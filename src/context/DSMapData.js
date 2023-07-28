import React, { createContext, useState, useEffect, useContext} from 'react';
import {BaseContext} from "./BaseData.js";
import {BASEURL} from "../constant/urlconstants.js";
import { MAPBLANK } from '../constant/urlconstants';
import { Auth } from 'aws-amplify';

const mapinfo_blank = JSON.parse(JSON.stringify(MAPBLANK));


export const MapQContext = createContext();

export const MapQProvider = (props) => {

  const[mapinfo, setMapInfo] = useState([mapinfo_blank]);
  const[isLoading, setIsLoading] = useState(true);

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId} = useContext(BaseContext);  
  
  useEffect(() => {
      // 처음 데이터를 읽어서 성공하면 State를 Update

    if(selected_course === "MGC000") return

    const fetchWorkInfo = async() => {

      const url_ = BASEURL + '/geojson/'+baseinfo.user.username +'?'+  new URLSearchParams({courseid: selected_course.toString() });

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

      try {
          const fetchData = await fetch(url_, myInit).then((response) => response.json())
          setIsLoading(false)
          console.log('Map Data is :',selected_course, fetchData.body, isLoading)
          setMapInfo(fetchData.body)
        } catch (err) { console.log('Workinfo Fetching Error', err) }
    }

      fetchWorkInfo();

  },[selected_course]);



  return(

  <MapQContext.Provider  value={{mapinfo, setMapInfo, isLoading, setIsLoading}}>
      {props.children}
  </MapQContext.Provider >
  
  );
}
