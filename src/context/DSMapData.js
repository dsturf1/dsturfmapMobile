import React, { createContext, useState, useEffect, useContext} from 'react';
import {BaseContext} from "./BaseData.js";
import {BASEURL} from "../constant/urlconstants.js";
import { GEOJSONBLANK , POLYGONBLANK, MAPBOXINI } from '../constant/urlconstants';
import { Auth } from 'aws-amplify';

const geojsoninfo_blank = JSON.parse(JSON.stringify(GEOJSONBLANK));
const targetpolygon_blank = JSON.parse(JSON.stringify(POLYGONBLANK));
const mapboxini_poly = JSON.parse(JSON.stringify(MAPBOXINI));

export const MapQContext = createContext();

export const MapQProvider = (props) => {

  const[geojsoninfo, setGeoJsonInfo] = useState([geojsoninfo_blank]);
  const[isLoading, setIsLoading] = useState(true);
  const[tpoly, setTPoly] = useState([])

  const[targetpolygons, setTargetPolygons] = useState([targetpolygon_blank]);
  const[holepoly, setHolePoly] = useState([])
  const[coursepoly, setCoursePoly] = useState([])
  const[selectedBoxpoly, setBoxPoly] = useState({...mapboxini_poly})

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, 
    maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);  
  
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

          console.log('Map Data is :',selected_course, fetchData.body, isLoading)
          // setGeoJsonInfo(fetchData.body)
          setGeoJsonInfo({...fetchData.body, 'features':fetchData.body['features'].sort((a, b) =>  baseinfo.area_def.filter((x)=>x.name ===a['properties'].Type)[0].DSZindex - 
            baseinfo.area_def.filter((x)=>x.name ===b['properties'].Type)[0].DSZindex)})


            let tpoly_ = [];

          
            tpoly_ = fetchData.body['features'].filter((poly_)=>poly_['properties'].TypeId >= 10).map((geojson_)=> {
              // return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon', coordinates: [[...geojson_['geometry']['coordinates'][0], geojson_['geometry']['coordinates'][0][0]]]}}
              return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon'}}
            })
            
            setTargetPolygons({
              'type': 'geojson',
              'data': {
                ...fetchData.body, features:[...tpoly_]
              }              
            })
  
            tpoly_ = fetchData.body['features'].filter((poly_)=>poly_['properties'].TypeId === 3).map((geojson_)=> {
              return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon'}}
            })
            setHolePoly({
              'type': 'geojson',
              'data': {
                ...fetchData.body, features:[...tpoly_]
              }              
            })
  
            tpoly_ = fetchData.body['features'].filter((poly_)=>poly_['properties'].TypeId === 2 || poly_['properties'].TypeId === 1).map((geojson_)=> {
              return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon'}}
            })
            setCoursePoly({
              'type': 'geojson',
              'data': {
                ...fetchData.body, features:[...tpoly_]
              }              
            })
  
            tpoly_ = fetchData.body['features'].filter((poly_)=>poly_['properties'].TypeId === 1).map((geojson_)=> {
              return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon'}}
            }) 
            console.log(tpoly_)           
            setBoxPoly({
              'type': 'geojson',
              'data': tpoly_[0]              
            })

            setIsLoading(false)


        } catch (err) { console.log('Workinfo Fetching Error', err) }
    }

      fetchWorkInfo();
      // setSelectedCourseInfo(null)
      setPolyGon(null)


  },[selected_course]);



  return(

  <MapQContext.Provider  value={{geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading, tpoly, setTPoly,  holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly, targetpolygons, setTargetPolygons}}>
      {props.children}
  </MapQContext.Provider >
  
  );
}
