import React, { createContext, useState, useEffect, useContext} from 'react';
import {BaseContext} from "./BaseData.js";
import {BASEURL} from "../constant/urlconstants.js";
import {createGeoJSONCircle} from "../components/DSBasics/DSCordUtils.js";
import { GEOJSONBLANK , POLYGONBLANK, MAPBOXINI, INTERESTED_POINT, INTERESTED_POLYGONBLANK  } from '../constant/urlconstants';
import { Auth } from 'aws-amplify';

/*
  Download All course Geojson data from REST API by course ID
  Divide the data into key area thru context API.
  Turf.Js : GeoJson Type Feature collection or Feature
  MAPBOX : {
      'type': 'geojson',
      'data': { Feature or FeatureCollections (?)}
  }
  Leaflet: Turf JS Same
  KAKAO: custom def (Weird)

  isCRSLoading
  CRSgeojsoninfo: Feacture collections
  greenpoly: MAPBOX Type
  holepoly: MAPBOX Type
  coursepoly: MAPBOX Type
  selectedBoxpoly: MAPBOX Type
  CRStpoly : CRSpolygons that are selected by DSPolySelect MenuBAR


*/

const geojsoninfo_blank = JSON.parse(JSON.stringify(GEOJSONBLANK));
const mapboxini_poly = JSON.parse(JSON.stringify(MAPBOXINI));

export const MapCRSQContext = createContext();

export const MapCRSQProvider = (props) => {

  const[CRSgeojsoninfo, setCRSGeoJsonInfo] = useState([geojsoninfo_blank]);
  const[isCRSLoading, setIsCRSLoading] = useState(true);
  const[CRStpoly, setCRSTPoly] = useState([])

  const[greenpoly, setGreenPoly] = useState([])
  const[holepoly, setHolePoly] = useState([])
  const[coursepoly, setCoursePoly] = useState([])
  const[selectedBoxpoly, setBoxPoly] = useState({...mapboxini_poly})

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, 
    maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);  
  
  useEffect(() => {
      // 처음 데이터를 읽어서 성공하면 State를 Update

    if(selected_course === "MGC000"){
      setGreenPoly([])
      setHolePoly([])
      setCoursePoly([])
      setBoxPoly({...mapboxini_poly})
      setPolyGon(null)
      setIsCRSLoading(true)
      return

    }

    const fetchWorkInfo = async() => {

      const url_ = BASEURL + '/course_geojson/'+baseinfo.user.username +'?'+  new URLSearchParams({courseid: selected_course.toString() });

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

          console.log('Map Data is :',selected_course, fetchData.body, isCRSLoading)
          // setGeoJsonInfo(fetchData.body)
          setCRSGeoJsonInfo({...fetchData.body, 'features':fetchData.body['features'].sort((a, b) =>  baseinfo.area_def.filter((x)=>x.name ===a['properties'].Type)[0].DSZindex - 
            baseinfo.area_def.filter((x)=>x.name ===b['properties'].Type)[0].DSZindex)})


          let tpoly_ = [];          

          tpoly_ = fetchData.body['features'].filter((poly_)=>poly_['properties'].TypeId === 4).map((geojson_)=> {
            return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon'}}
          })
          setGreenPoly({
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
          // console.log(tpoly_)           
          setBoxPoly({
            'type': 'geojson',
            'data': tpoly_[0]              
          })

          setIsCRSLoading(false)


        } catch (err) { alert("코스지도데이터 오류") }
    }

      fetchWorkInfo();

  },[selected_course]);

  useEffect(() => {

    console.log(CRSgeojsoninfo, selectedBoxpoly, holepoly, greenpoly)
  },[CRSgeojsoninfo, selectedBoxpoly, holepoly]);

  return(

  <MapCRSQContext.Provider  value={{CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, CRStpoly, setCRSTPoly, 
    greenpoly, setGreenPoly, holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly}}>
      
      {props.children}
  </MapCRSQContext.Provider >
  
  );
}
