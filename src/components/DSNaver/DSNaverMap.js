import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography ,Button} from '@mui/material';


import { SInfoContext} from "../../context/DSSearchData.js"

const DSNaverMap = () => {

  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord} = useContext(SInfoContext);

  const mapRef = useRef(null);
  const [map, setMap] = useState(null)

  const [zoom, setZoom] = useState(15)


  useEffect(() => {

    const { naver } = window;
    if (!mapRef.current || !naver) return;

    // 지도에 표시할 위치의 위도와 경도 좌표를 파라미터로 넣어줍니다.
    const location = new naver.maps.LatLng(37.5656, 126.9769);
    const mapOptions = {
      center: location,
      zoom: zoom,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
      },
    };
    setMap(new naver.maps.Map(mapRef.current, mapOptions));

  }, []);


  


  useEffect(() => {

    const { naver } = window;
    if (!mapRef.current || !naver) return;
    if (selected_info === null) return

    map.setCenter(new window.naver.maps.LatLng(Number(selected_info.y), Number(selected_info.x)));
    map.setZoom(zoom, true);
    
    console.log(map.getBounds())
      
    
  }, [selected_info])

  return (
    <Fragment>
      {/* <div style={{ width: "100%", height: "100%" }}> */}
      {/* <div id ="map" style={{ width: "1000px", height: "800px" }} /> */}
      <div ref={mapRef} style={{ width: "1000px", height: "800px" }}/>
      {/* <img src={"https://naveropenapi.apigw.ntruss.com/map-static/v2/raster-cors?w=1000&h=1000&center="+center.x +"," + center.y + "&level=" +(zoom-1).toString()+"&scale=2&X-NCP-APIGW-API-KEY-ID=f4plizrvxg"}  */}
      {/* style={{ width: "1000px", height: "1000px" }}></img> */}
      {/* </div> */}
    </Fragment>
  );
}

export default DSNaverMap;