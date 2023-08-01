import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { Map, MapMarker, ZoomControl, MapTypeControl,StaticMap} from 'react-kakao-maps-sdk';
import { ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, Typography ,Button} from '@mui/material';
import html2canvas from "html2canvas";
import saveAs from "file-saver";
import "./styles.css";

import { BaseContext, SInfoContext} from "../../context"

const DSSearchMap = () => {

  const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord} = useContext(SInfoContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo} = useContext(BaseContext);

  const [info, setInfo] = useState()
  const [markers, setMarkers] = useState([])
  const mapRef = useRef()

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
      // setMapBound()


      // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
      map.setBounds(bounds)
      
      
    
  }, [searchinfo])

  useEffect(() => {

    let map = mapRef.current;
    if (!map) return

    console.log('MapInfo Chnaged @ DSSearchMap',mapinfo)
      
    
  }, [mapinfo])

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
    
  }, [selected_info])

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
      }
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