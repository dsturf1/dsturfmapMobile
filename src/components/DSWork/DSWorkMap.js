import React, { useRef, useEffect, useState, useContext , Fragment} from 'react';
import { Box, Button, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress} from '@mui/material';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { BaseContext, MapQContext} from "../../context"
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, bbox as turfbbox ,centroid as turfcentroid} from "@turf/turf";

import './Map.css';


import { BASEURL,  MAPBLANK, MAPINFO_INI, COURSEBLANK,POLYGONBLANK,  GEOJSONBLANK } from '../../constant/urlconstants';
import { ContactPageSharp } from '@mui/icons-material';


const polgygon_ini = JSON.parse(JSON.stringify(POLYGONBLANK));

const geojsoninfo_blank = JSON.parse(JSON.stringify(GEOJSONBLANK));
mapboxgl.accessToken = 'pk.eyJ1IjoiZHNncmVlbiIsImEiOiJjbGw1M2xiMXIwNHYzM2RxcGFxZmZnczVoIn0.LLYuSMxi61w-YvfqXsDW0g';
 
export default function DSWorkMap(props) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selected_hole, setHole] = useState(0);
  const [selected_CRS, setCRS] = useState('전코스');

  const {geojsoninfo, setGeoJsonInfo,targetpolygons, setTargetPolygons, isLoading, setIsLoading,  holepoly, setHolePoly, coursepoly, setCoursePoly, selectedBoxpoly, setBoxPoly} = useContext(MapQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, 
    loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo} = useContext(BaseContext);



 
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      // style: 'mapbox://styles/mapbox/streets-v12',
      center:mapinfo.center ,
      zoom: 14
    });

    map.current.addControl(new mapboxgl.NavigationControl());

 
    // map.current.on('move', () => {
    //   setLng(map.current.getCenter().lng.toFixed(4));
    //   setLat(map.current.getCenter().lat.toFixed(4));
    //   setZoom(map.current.getZoom().toFixed(2));
    // });
    // console.log(holepoly,coursepoly)
    map.current.on('load', function () {
      // map.current.resize();
      // if (selected_course === "MGC000") return

      map.current.addSource('Target-Area', {
        'type': 'geojson',
        'data': {
          ...geojsoninfo_blank
        }              
      }
      
      
      
      );
      
    
      map.current.addLayer({
        'id': 'Target_Area',
        'type': 'fill',
        'source': 'Target-Area',
        'paint': {
        'fill-color': "#d90429",
        'fill-opacity': 0.4
        },
        'filter': ['==', '$type', 'Polygon']
        });

      const layers = map.current.getStyle().layers;

      let firstSymbolId;
      for (const layer of layers) {
        if (layer.type === 'Polygon') {
        firstSymbolId = layer.id;
        break;
        }
      }
      map.current.addSource('BoxArea', 
      {
        'type': 'geojson',
        'data': {
        'type': 'Feature',
        'geometry': {
        'type': 'Polygon',
        'coordinates': []
        }
        }
        });
      map.current.addLayer({
        'id': 'Box_Area',
        'type': 'line',
        'source': 'BoxArea',
        "layout": {
          'visibility': 'visible',
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#ffd500',
          'line-width': 3  
        },        
        'filter': ['==', '$type', 'Polygon']
        }, 'Target_Area');

      map.current.on('click','Target_Area',  (e) => {

        const coordinates = e.features[0].geometry.coordinates[0][0];
        const description = '<strong>'+e.features[0].properties.Course+' '+ e.features[0].properties.Hole+
        '홀</strong><p>'+e.features[0].properties.Desc+'</p>'
        
        ;
         
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        // coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        // }
        // console.log(turfcentroid(e.features[0].geometry.coordinates[0]))
        new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map.current);
  
        });

    });




  })

  useEffect(() => {
    // if (map.current) return; // initialize map only once

    // console.log("Fyling to Cousre", selected_course)


    if (selected_course === "MGC000"){
      setCRS('전코스')
      setHole(0)      
      return
    }

    // map.current.flyTo({
    //   center: baseinfo.course_info.filter((x)=> x.id === selected_course)[0].map_info.center,
    //   })
    // if (Object.keys(selectedBoxpoly ).length!== 0 && map.current !== null){
    //     if (map.current.getSource('BoxArea') != null) map.current.getSource('BoxArea').setData({...selectedBoxpoly});
    //     }
  

  },[selected_course]);

  useEffect(() => {

    let bbox_ =turfbbox(selectedBoxpoly.data);
    map.current.fitBounds(bbox_, {padding: 20});

    if (Object.keys(selectedBoxpoly ).length!== 0 && map.current !== null){
        if (map.current.getSource('BoxArea') != null) map.current.getSource('BoxArea').setData({...selectedBoxpoly.data});
        }

  },[selectedBoxpoly]);


  useEffect(() => {

    if (Object.keys(selectedBoxpoly ).length!== 0 && map.current !== null){
        if (map.current.getSource('Target-Area') != null) map.current.getSource('Target-Area').setData({...targetpolygons.data});
        }

  },[targetpolygons]);


  useEffect(() => {
    
    if (Object.keys(coursepoly).length === 0 || Object.keys(holepoly).length ===0) return

    let selected_boxpoly_ = {}

    if (selected_CRS === '전코스'){
      selected_boxpoly_ = coursepoly.data.features.filter((x) => x.properties.Course === selected_CRS)[0]

    }

    else{
      selected_boxpoly_ = selected_hole === 0? coursepoly.data.features.filter((x) => x.properties.Course === selected_CRS)[0]:
      holepoly.data.features.filter((x) => x.properties.Hole === selected_hole && x.properties.Course === selected_CRS )[0]
    }



    // console.log(selected_boxpoly_, holepoly)

    let bbox_ =turfbbox(selected_boxpoly_);
    map.current.fitBounds(bbox_, {padding: 20});

    if (Object.keys(selected_boxpoly_ ).length!== 0 && map.current !== null){
      if (map.current.getSource('BoxArea') != null) map.current.getSource('BoxArea').setData({...selected_boxpoly_});

    }
    setBoxPoly({
      'type': 'geojson',
      'data': {...selected_boxpoly_} 
    })
    console.log(selected_boxpoly_)

  },[selected_CRS, selected_hole]);


 
  return (
    <Fragment>
      <div ref={mapContainer} className="map-container" />
      <Stack direction="row" spacing={2}   justifyContent="center"  alignItems="center" mt = {2}> 
        <FormControl sx={{ width: 1/2}}size="small">
          <InputLabel id="ds-crs-select-label">코스명</InputLabel>
          <Select
            labelId="ds-crs-select-label"
            // sx={{ bgcolor: 'primary.main' }}
            id="ds-crs-select"
            value={selected_CRS}
            label="코스"
            onChange={(event) => {setCRS(event.target.value);setHole(0)}}
            sx={{ fontSize: 12, fontWeight: 'medium' }}
          >
            <MenuItem value={'전코스'}>{'전코스'}</MenuItem>   
            {selected_course_info && selected_course_info.course_names.map((x) =>
            <MenuItem value={x}>{x}</MenuItem>            
            )}
          </Select>
        </FormControl>
        <FormControl  sx={{ width: 1/4}}size="small">
          <InputLabel id="ds-year-select-label">홀</InputLabel>
          <Select
            labelId="ds-hole-select-label"
            sx={{ fontSize: 12, fontWeight: 'medium'}}
            id="ds-hole-select"
            value={selected_hole}
            label="홀"
            onChange={(event) => {setHole(event.target.value)}}
          >
          {[0,1,2,3,4,5,6,7,8,9].map((x)=>
            <MenuItem value={x}>{x}</MenuItem> 
          )}
          </Select>
        </FormControl>
      </Stack>
    </Fragment>

  );
}