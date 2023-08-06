import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { Map, MapMarker, ZoomControl, MapTypeControl,StaticMap, Polygon} from 'react-kakao-maps-sdk';
import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography ,Button} from '@mui/material';
import html2canvas from "html2canvas";
import saveAs from "file-saver";
import  {ds_mgrData2kakao, ds_geojson2kakao}from "../DSBasics/DSCordUtils.js"

import { BaseContext, SInfoContext, MapQContext} from "../../context"

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


  }, [selected_course])


  return (
    <Fragment>
      <Map 
        center={{lat:mapinfo.center[1], lng:mapinfo.center[0]}}
        style={{
          width: "100%",
          height: "100%",
        }}
        level={mapinfo.level}
        ref={mapRef}
        onBoundsChanged={(map) => setMapInfo({center: [map.getCenter().getLng(),map.getCenter().getLat()],level:map.getLevel(),
          bounds:{
            sw: [map.getBounds().getSouthWest().getLng(), map.getBounds().getSouthWest().getLat()],
            ne: [map.getBounds().getNorthEast().getLng(), map.getBounds().getNorthEast().getLat()]
          }
        })
      }>

        <ZoomControl position={kakao.maps.ControlPosition.TOPRIGHT} />
        <MapTypeControl />
        {selected_mode === "MAPGEOJSONEDIT"? null: <DSPolyGons/>}
      </Map>
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
          // console.log(geojson_['properties'].Type)
            return <DSPolyGon 
              key = {geojson_['properties'].Type + geojson_['properties'].Hole}
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