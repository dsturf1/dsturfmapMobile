import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { Map, MapMarker, ZoomControl, MapTypeControl,StaticMap} from 'react-kakao-maps-sdk';
import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography ,Button} from '@mui/material';
import html2canvas from "html2canvas";
import saveAs from "file-saver";
import "./styles.css";

import { SInfoContext} from "../../context/DSSearchData.js"

const DSSearchMap = () => {

  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord} = useContext(SInfoContext);

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
    if (searchinfo.length === 0) return

      const bounds = new kakao.maps.LatLngBounds()
      let markers = []

      for (var i = 0; i < searchinfo.length; i++) {
        // @ts-ignore
        markers.push({
          position: {
            lat: searchinfo[i].y,
            lng: searchinfo[i].x,
          },
          content: searchinfo[i].place_name,
        })
        // @ts-ignore
        bounds.extend(new kakao.maps.LatLng(searchinfo[i].y,searchinfo[i].x))
      }
      setMarkers(markers)

      // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
      map.setBounds(bounds)
      
    
  }, [searchinfo])


  useEffect(() => {

    let map = mapRef.current;

    if (!map) return
    if (selected_info === null) return

    let marker = {};

    marker = {
      position: {
        lat: selected_info.y,
        lng: selected_info.x,
      },
      content: selected_info.place_name,
    }

    console.log("Selected in Map:",selected_info)

    setInfo(marker);
    map.setCenter(new kakao.maps.LatLng(selected_info.y, selected_info.x));
    map.setLevel(4);
    setMarkers([marker])
    // setState(
    //   {...state,center: { lat: selected_info.y, lng: selected_info.x}, zooom:6 }
    // )
      
    
  }, [selected_info])

  
  // const handleDownload = async () => {
  //   if (!divRef.current) return;
  //     try {
  //       const div = divRef.current;
  //       const canvas = await html2canvas(div, { scale: 2 });
  //       canvas.toBlob((blob) => {
  //         if (blob !== null) {
  //           saveAs(blob, "result.png");
  //         }
  //       });
  //     } catch (error) {
  //       console.error("Error converting div to image:", error);
  //     }

  //   }

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
        {markers.map((marker) => (
          <MapMarker
            key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
            position={marker.position}
            onClick={() => setInfo(marker)}
          >
            {info &&info.content === marker.content && (
              <div style={{color:"#000"}}>{marker.content}</div>
            )}
          </MapMarker>
        ))}
      </Map>
    </Fragment>
  )
}

export default DSSearchMap;