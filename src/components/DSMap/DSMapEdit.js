import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { Map, MapMarker, ZoomControl, MapTypeControl,StaticMap} from 'react-kakao-maps-sdk';
import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography ,Button} from '@mui/material';
import html2canvas from "html2canvas";
import saveAs from "file-saver";

import { BaseContext, SInfoContext, MapQContext} from "../../context"

const DSMapEdit = () => {

  const {mapinfo, setMapInfo, isLoading, setIsLoading} = useContext(MapQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId} = useContext(BaseContext);

  const [info, setInfo] = useState()
  const [markers, setMarkers] = useState([])
  // const [map, setMap] = useState()
  const mapRef = useRef()
  const divRef = useRef(null)

  const [state, setState] = useState({
    // 지도의 초기 위치
    center: { lat: 36.520, lng: 128.110 },
    // 지도 위치 변경시 panto를 이용할지에 대해서 정의
    isPanto: true,
    zoom:12
  })

  const { kakao } = window;

  useEffect(() => {

    let map = mapRef.current;

    if (!map) return
    if (selected_course === "MGC000") return      

    // map.setCenter(new kakao.maps.LatLng(selected_course.center[1], selected_course.center[0]));
    // map.setLevel(selected_course.level);

    var bounds = new kakao.maps.LatLngBounds(new kakao.maps.LatLng(selected_course.bounds.sw[1], selected_course.bounds.sw[0]), new kakao.maps.LatLng(selected_course.bounds.ne[1], selected_course.bounds.ne[0]))
    map.setBounds(bounds)
    
  }, [selected_course])


  return (
    <Fragment>
      <Map 
        center={state.center}
        style={{
          width: "100%",
          height: "100%",
        }}
        level={state.zoom}
        ref={mapRef}
      >

        <ZoomControl position={kakao.maps.ControlPosition.TOPRIGHT} />
        <MapTypeControl />
      </Map>
    </Fragment>
  )
}

export default DSMapEdit;