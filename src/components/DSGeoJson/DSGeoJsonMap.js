import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { Map, MapMarker, ZoomControl, MapTypeControl,StaticMap, Polygon, DrawingManager} from 'react-kakao-maps-sdk';
import { Box, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, ButtonGroup ,Button} from '@mui/material';
import html2canvas from "html2canvas";

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import saveAs from "file-saver";
import  {ds_mgrData2kakao, ds_geojson2kakao, ds_mgrData2geojson}from "../DSBasics/DSCordUtils.js"

import { BaseContext, SInfoContext, MapQContext} from "../../context"
import { BASEURL,  MAPBLANK, MAPINFO_INI, COURSEBLANK,POLYGONBLANK } from '../../constant/urlconstants';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon } from "@turf/turf";

const DSGeoJsonMap = () => {

  const {geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading} = useContext(MapQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo} = useContext(BaseContext);

  const [info, setInfo] = useState()
  const [markers, setMarkers] = useState([])


  const mapRef = useRef()

  const { kakao } = window;





  useEffect(() => {
    if (selected_course === "MGC000") setMode("MAPSelect")

  }, [])

  useEffect(() => {

    let map = mapRef.current;

    if (!map) return
    if (selected_course === "MGC000") return
    setMode("MAPEdit")
    // console.log(mapRef.current)


  }, [selected_course, geojsoninfo])


  return (
    <Fragment>
      
      <Box height="100%" sx={{ position:'relative', p: 0, border: '1px solid gray',gap: 0, borderRadius: 0 , m: 0}}>
      <Map 
        center={{lat:mapinfo.center[1], lng:mapinfo.center[0]}}
        style={{
          width: "100%",
          height: "100%",
        }}
        level={mapinfo.level}
        ref={mapRef}
        onClick={(_t, mouseEvent) => {
        let pt = turfpoint([mouseEvent.latLng.getLng(), mouseEvent.latLng.getLat()])
        console.log(pt, tpoly)
        }
        }
        onBoundsChanged={(map) => setMapInfo({center: [map.getCenter().getLng(),map.getCenter().getLat()],level:map.getLevel(),
          bounds:{
            sw: [map.getBounds().getSouthWest().getLng(), map.getBounds().getSouthWest().getLat()],
            ne: [map.getBounds().getNorthEast().getLng(), map.getBounds().getNorthEast().getLat()]
          }
        })
      }>

        {/* <ZoomControl position={kakao.maps.ControlPosition.TOPRIGHT} /> */}
        <MapTypeControl />
        <DSPolyEdit/>
        {selected_mode === "MAPGEOJSONEDIT"? null: <DSPolyGons/>}
        {console.log("@MAP", selected_mode)}
        
      </Map>
      </Box>
    </Fragment>
  )
}

export default DSGeoJsonMap;

function DSPolyGons(){

  const {geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading} = useContext(MapQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo} = useContext(BaseContext);
  

  return(
    <>
        {isLoading === false && geojsoninfo['features'][0]['geometry']['coordinates'].length > 0 ?
          geojsoninfo['features'].filter((polyg_)=> baseinfo.area_def.filter((x)=>x.name ===polyg_['properties'].Type)[0].display).map((geojson_)=>{
            // geojsoninfo['features'].map((geojson_)=>{
          // console.log("Drawing", geojson_, baseinfo.area_def.filter((x)=> x.name === geojson_['properties'].Type )[0].color)
           setTPoly([...tpoly, turfpolygon(geojson_['geometry']['coordinates'])])
           
            return <DSPolyGon 
              key = {geojson_['properties'].Id}
              geojson_path = {geojson_['geometry']['coordinates'][0]}
              geojson_color = {baseinfo.area_def.filter((x)=> x.name === geojson_['properties'].Type )[0].color}
              geojson = {geojson_}
            />
            }
          ):null
        }
    </>
  )
}

function DSPolyGon({geojson_path,geojson_color, geojson}){

  const {geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading} = useContext(MapQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
  const [isMouseOver, setIsMouseOver] = useState(false)

  return(
    <>
      <Polygon 
        path = {ds_geojson2kakao(geojson_path)}
        key={geojson.properties.Id}
        strokeWeight={1} // 선의 두께입니다
        strokeColor={geojson_color} // 선의 색깔입니다
        strokeOpacity={0.8} // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle={"solid"} // 선의 스타일입니다
        fillColor={geojson_color} // 채우기 색깔입니다
        fillOpacity={selected_polygon===null? 0.1: (selected_polygon.properties.Id === geojson.properties.Id? 0.4:(isMouseOver ?0.2:0.1))} // 채우기 불투명도 입니다
        onMouseover={() => setIsMouseOver(true)}
        onMouseout={() => setIsMouseOver(false)}
        onMousedown={(_polygon, mouseEvent) => {
          setPolyGon({...geojson})
          // console.log(selected_polygon)
        }}
      />            
    </>
  )
}


function DSPolyEdit(){

  const {geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading} = useContext(MapQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, 
    loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
  const managerRef = useRef(null)
  const [local_mode, setLocalMode] = useState('DSMAPGEOJSON_INI')

  let polygon_info_ini = JSON.parse(JSON.stringify(POLYGONBLANK));

  const { kakao } = window;

  

  function selectOverlay(type) {
    const manager = managerRef.current
    manager.cancel()
    manager.select(type)
  }

  useEffect(() => {
    if (selected_mode === "MAPGEOJSONEDIT") {
      if (local_mode === 'DSMAPGEOJSON_ADD') {
        managerRef.current.cancel()
        selectOverlay(kakao.maps.drawing.OverlayType.POLYGON)
      }
      // if (local_mode === 'DSMAPGEOJSON_EDIT') {
      //   managerRef.current.cancel()
      //   selectOverlay(kakao.maps.drawing.OverlayType.POLYGON)
      // }
    }
    if (selected_mode === "MAPEdit" && managerRef.current!== null) {

      managerRef.current.cancel();
      let polygon_in_mgr = managerRef.current.getData();

      console.log(polygon_in_mgr)
      // if (polygon_in_mgr.length>0)
      polygon_in_mgr.polygon.forEach((poly_) => {
        polygon_info_ini = {...polygon_info_ini,geometry:{coordinates: [ds_mgrData2geojson(poly_.points)]},properties:{ ...polygon_info_ini.properties ,Id:uuidv4()}}
        console.log(polygon_info_ini, geojsoninfo,{...geojsoninfo, features:[...geojsoninfo.features,polygon_info_ini]})
        setGeoJsonInfo({...geojsoninfo, features:[...geojsoninfo.features,polygon_info_ini]})
        if (managerRef.current.getOverlays().polygon.length >0) {
          // console.log(managerRef.current.getOverlays().polygon[0])
        managerRef.current.remove(managerRef.current.getOverlays().polygon[0]);
        }
      })
      

    }

  },[selected_mode, local_mode]);

  return(
    <>
        {isLoading === false?
      <Fragment>
        <DrawingManager
          ref={managerRef}
          // drawingMode={[
          //   kakao.maps.drawing.OverlayType.POLYGON,
          // ]}
          guideTooltip={["draw", "drag", "edit"]}
          polygonOptions={{
            draggable: true,
            removable: true,
            editable: true,
            strokeColor: "#39f",
            strokeWeight:1,
            fillColor: "#39f",
            fillOpacity: 0.5,
            hintStrokeStyle: "solid",
            hintStrokeOpacity: 0.5,
          }}
          onDrawend = {(data)=>{
            managerRef.current.cancel();
            setLocalMode('DSMAPGEOJSON_INI')
            // selectOverlay(kakao.maps.drawing.OverlayType.POLYGON)
            // setMode("MAPEdit");
            // data.remove(data.getOverlays())
            // if (managerRef.current.getOverlays().polygon.length >0) managerRef.current.remove(managerRef.current.getOverlays().polygon[0]);
            // console.log("DrawEnd", managerRef.current.getData().polygon[0]);
          }}
        />
        {selected_mode === "MAPGEOJSONEDIT"?
         <Fab color="primary" aria-label="add" size="small" variant="extended"
         sx ={{
             position: 'absolute',
             top: 16,
             left: 16,
         }}
         onClick={() => {setLocalMode('DSMAPGEOJSON_ADD'); console.log(local_mode)}}
         disabled = {local_mode=== 'DSMAPGEOJSON_ADD'}
       >
         <AddIcon />
         New Polygon
       </Fab>:null}

    </Fragment>
        :null
        }

    </>
  )
}