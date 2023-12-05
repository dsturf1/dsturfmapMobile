import React, { createContext, useState, useEffect, useContext} from 'react';
import {BaseContext} from "./BaseData.js";
import {BASEURL} from "../constant/urlconstants.js";
import {createGeoJSONCircle} from "../components/DSBasics/DSCordUtils.js";
import { GEOJSONBLANK , POLYGONBLANK, MAPBOXINI, INTERESTED_POINT, INTERESTED_POLYGONBLANK  } from '../constant/urlconstants';
import { Auth } from 'aws-amplify';

const geojsoninfo_blank = JSON.parse(JSON.stringify(GEOJSONBLANK));
const targetpolygon_blank = JSON.parse(JSON.stringify(INTERESTED_POLYGONBLANK));
const targetpoint_blank = JSON.parse(JSON.stringify(INTERESTED_POINT));


export const MapQContext = createContext();

export const MapQProvider = (props) => {

  const[geojsoninfo, setGeoJsonInfo] = useState([geojsoninfo_blank]);
  const[isLoading, setIsLoading] = useState(true);

  const[targetpolygons, setTargetPolygons] = useState([targetpolygon_blank]);
  const[targetpoints, setTargetPoints] = useState([targetpoint_blank]);

  const[tpoly, setTPoly] = useState([]);


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, 
    maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);  
  
  useEffect(() => {
      // 처음 데이터를 읽어서 성공하면 State를 Update

    if(selected_course === "MGC000"){
      setPolyGon(null)
      setIsLoading(true)
      return
    }

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
        // Data를 sort한 후, 모든 폴리건 id를 생성된 당시의 Id로 변환

        let geojsondata_ = fetchData.body['features'].sort((a, b) =>  baseinfo.area_def.filter((x)=>x.name ===a['properties'].Type)[0].DSZindex - 
        baseinfo.area_def.filter((x)=>x.name ===b['properties'].Type)[0].DSZindex)

        geojsondata_ = geojsondata_.map((geo_) => {return {...geo_, id: geo_.properties.Id, 
          properties:{...geo_.properties, alllabelsL1: geo_.properties.Labels.map((x) => x.level1).filter((x) => x!=='').join(', ')} 
          }})//모든 폴리건 id를 생성된 당시의 Id로 변환

        console.log('Map Data is :',selected_course, geojsondata_, isLoading)


        setGeoJsonInfo({...fetchData.body, 'features':[...geojsondata_]})   
        setIsLoading(false)
        } catch (err) { console.log('Workinfo Fetching Error', err) }
    }

    fetchWorkInfo();
    setPolyGon(null)
  },[selected_course]);


  useEffect(() => {
    // 처음 데이터를 읽어서 성공하면 State를 Update

    if(selected_course === "MGC000"|| isLoading === true) return

    console.log('GEOJSON UPDATED', geojsoninfo)

    let geojsondata_ = geojsoninfo['features'].sort((a, b) =>  baseinfo.area_def.filter((x)=>x.name ===a['properties'].Type)[0].DSZindex - 
    baseinfo.area_def.filter((x)=>x.name ===b['properties'].Type)[0].DSZindex)

    geojsondata_ = geojsondata_.map((geo_) => {return {...geo_, id: geo_.properties.Id}})//모든 폴리건 id를 생성된 당시의 Id로 변환

    let tpoly_ = [];

    tpoly_ = geojsondata_.filter((poly_)=>poly_['properties'].TypeId === 10 && poly_['properties'].Valid !== false).map((geojson_)=> {
      return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon'}}
    })
    
    let tcircle_poly_ = geojsondata_.filter((poly_)=>poly_['properties'].TypeId === 11&& poly_['properties'].Valid !== false).map((geojson_)=> {
      return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon', 
      coordinates:createGeoJSONCircle(geojson_.geometry.coordinates, geojson_.properties.radius/1000.)}}
    })

    tpoly_ = [...tpoly_, ...tcircle_poly_]
    
    // console.log("..Circle", [...tpoly_, ...tcircle_poly_])
    setTargetPolygons({
      'type': 'geojson',
      'data': {
        ...geojsoninfo, features:[...tpoly_]
      }              
    })

    tpoly_ = geojsondata_.filter((poly_)=>poly_['properties'].TypeId === 11&& poly_['properties'].Valid !== false).map((geojson_)=> {
      return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Point'}}
    })
    
    setTargetPoints({
      'type': 'geojson',
      'data': {
        ...geojsoninfo, features:[...tpoly_]
      }              
    })

  },[geojsoninfo]);



  return(

  <MapQContext.Provider  value={{geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading,tpoly, setTPoly,targetpolygons, setTargetPolygons, targetpoints, setTargetPoints}}>
      {props.children}
  </MapQContext.Provider >
  
  );
}
