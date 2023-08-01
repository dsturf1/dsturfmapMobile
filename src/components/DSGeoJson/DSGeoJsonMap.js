import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { Map, MapMarker, ZoomControl, MapTypeControl,StaticMap} from 'react-kakao-maps-sdk';
import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography ,Button} from '@mui/material';
import html2canvas from "html2canvas";
import saveAs from "file-saver";

import { BaseContext, SInfoContext, MapQContext} from "../../context"

const DSGeoJsonMap = () => {

  const {geojsoninfo, setGeoJsonInfo, isLoading, setIsLoading} = useContext(MapQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo} = useContext(BaseContext);

  const [info, setInfo] = useState()
  const [markers, setMarkers] = useState([])
  const mapRef = useRef()


  const { kakao } = window;

  useEffect(() => {
    if (selected_course === "MGC000") setMode("CoursePick")

  }, [])

  useEffect(() => {

    let map = mapRef.current;

    if (!map) return
    if (selected_course === "MGC000") return
    setMode("CourseEdit")


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
        // onZoomChanged={(map) => { 
        //   setMapInfo({...mapinfo,level:map.getLevel()})
        //   // console.log(map.getLevel())
        //   }
        // }
        onBoundsChanged={(map) => setMapInfo({center: [map.getCenter().getLng(),map.getCenter().getLat()],level:map.getLevel(),
          bounds:{
            sw: [map.getBounds().getSouthWest().getLng(), map.getBounds().getSouthWest().getLat()],
            ne: [map.getBounds().getNorthEast().getLng(), map.getBounds().getNorthEast().getLat()]
          }
        })
      }>

        <ZoomControl position={kakao.maps.ControlPosition.TOPRIGHT} />
        <MapTypeControl />
      </Map>
    </Fragment>
  )
}

export default DSGeoJsonMap;