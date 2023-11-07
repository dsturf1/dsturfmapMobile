import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { Stack, Button, ButtonGroup} from '@mui/material';

import { Map, MapMarker, ZoomControl, MapTypeControl,StaticMap, Polygon, DrawingManager, Toolbox} from 'react-kakao-maps-sdk';
import { BaseContext, MapQContext, MapCRSQContext} from "../../context"

const DSKakaoMap = () => {

  // const {searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord} = useContext(SInfoContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo,selected_polygon, setPolyGon} = useContext(BaseContext);

  const mapRef = useRef(null);
  const [map, setMap] = useState(null)
  const [zoom, setZoom] = useState(14)

  function toDataURL(url) {
    return fetch(url)
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        return URL.createObjectURL(blob);
      });
  }
  
  async function download(name = "download", type = "png") {

    const nesw = map.getBounds()
    const bbox = '['+nesw._ne.x.toFixed(5) +',' + nesw._ne.y.toFixed(5)+','+nesw._sw.x.toFixed(5) +',' + nesw._sw.y.toFixed(5)+']'
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = await toDataURL("https://naveropenapi.apigw.ntruss.com/map-static/v2/raster-cors?w=250&h=250&center="+Number(mapinfo.center[1]) +"," + Number(mapinfo.center[0]) 
    + "&level=" +(zoom-1).toString()+"&scale=2&X-NCP-APIGW-API-KEY-ID=f4plizrvxg");
    a.download = baseinfo.course_info.filter((x)=> x.id === selected_course)[0].name+'L14' + "." + type;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    a.href = await toDataURL("https://naveropenapi.apigw.ntruss.com/map-static/v2/raster-cors?w=500&h=500&center="+Number(mapinfo.center[1]) +"," + Number(mapinfo.center[0]) 
    + "&level=" +(zoom).toString()+"&scale=2&X-NCP-APIGW-API-KEY-ID=f4plizrvxg");
    a.download = baseinfo.course_info.filter((x)=> x.id === selected_course)[0].name+'L15' + "." + type;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    a.href = await toDataURL("https://naveropenapi.apigw.ntruss.com/map-static/v2/raster-cors?w=2000&h=2000&center="+Number(mapinfo.center[1]) +"," + Number(mapinfo.center[0]) 
    + "&level=" +(zoom+2).toString()+"&scale=2&X-NCP-APIGW-API-KEY-ID=f4plizrvxg");
    a.download = baseinfo.course_info.filter((x)=> x.id === selected_course)[0].name+'L18'+bbox+"." + type;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


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
    if (selected_course === "MGC000") return;
    if(mapinfo === null) return;

    if (Object.keys(mapinfo).length === 0 || mapinfo.center.length === 0) return;
  
    map.setCenter(new window.naver.maps.LatLng(Number(mapinfo.center[1]), Number(mapinfo.center[0])));
    map.setZoom(zoom, true);
    
    

    naver.maps.Event.addListener(map, "bounds_changed", function(zoom_) {
      setZoom(map.getZoom())
      setMapInfo({...mapinfo, center:[map.getCenter().y, map.getCenter().x] })
      console.log("ZOOM CHANGED to ", map.getZoom())
      console.log("Bounds Is ", map.getBounds())
    });
      

  }, [mapinfo])

  return (
    <div>
      <Stack direction="row" spacing={1}   justifyContent="space-between"  alignItems="center" mt = {0}>
        <div ref={mapRef} style={{ width: "250px", height: "250px" }}/>
        {Object.keys(mapinfo).length >0 && mapinfo.center.length > 0?
          <StaticMap // 지도를 표시할 Container
            center={{
              // 지도의 중심좌표
              lat: Number(mapinfo.center[1]),
              lng: Number(mapinfo.center[0])
            }}
            style={{
              // 지도의 크기
              width: "250px",
              height: "250px",
            }}
            level={5} // 지도의 확대 레벨
          />
          :<null/>}
      </Stack>

      <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={2}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
        <Button variant="outlined"   onClick={() => download()}> Save</Button>
      </ButtonGroup>

    </div>

  );
}

export default DSKakaoMap;