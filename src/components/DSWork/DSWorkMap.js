import React, { useRef, useEffect, useState, useContext , Fragment} from 'react';
import { Box, Button, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress} from '@mui/material';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { BaseContext, MapQContext, MapCRSQContext} from "../../context"
import {createGeoJSONCircle} from "../DSBasics/DSCordUtils.js";
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, bbox as turfbbox ,centroid as turfcentroid} from "@turf/turf";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import * as turf from "@turf/turf";
import {label_single} from '../../constant/labelconstants.js';
import './Map.css';


import { BASEURL,  MAPBLANK, MAPINFO_INI, COURSEBLANK,POLYGONBLANK,  GEOJSONBLANK, MAPBOXINI, INTERESTED_POLYGONBLANK, INTERESTED_POINT } from '../../constant/urlconstants';
import { ContactPageSharp } from '@mui/icons-material';
import { initMAP, check_CRSandHole} from './DSWorkMapHelp.js';
import DSAreaPicker from '../DSBascisArea/DSAreaPickerSmall.js';


const polgygon_ini = JSON.parse(JSON.stringify(INTERESTED_POLYGONBLANK));
const point_ini = JSON.parse(JSON.stringify(INTERESTED_POINT));
const mapboxini_poly = JSON.parse(JSON.stringify(MAPBOXINI));
const geojsoninfo_blank = JSON.parse(JSON.stringify(GEOJSONBLANK));

mapboxgl.accessToken = 'pk.eyJ1IjoiZHNncmVlbiIsImEiOiJjbGw1M2xiMXIwNHYzM2RxcGFxZmZnczVoIn0.LLYuSMxi61w-YvfqXsDW0g';
 
export default function DSWorkMap(props) {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [draw, setDraw] = useState(null);
  
  const [selected_hole, setHole] = useState(0);
  const [selected_CRS, setCRS] = useState('전코스');

  const [mapbearing, setMapBearing] = useState(0);

  const {geojsoninfo, setGeoJsonInfo,tpoly, setTPoly,
    targetpolygons, setTargetPolygons, targetpoints, setTargetPoints, isLoading, setIsLoading} = useContext(MapQContext);
  const {isCRSLoading, setIsCRSLoading, greenpoly, setGreenPoly, 
    holepoly, setHolePoly, coursepoly, setCoursePoly, selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, 
    loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo, 
    selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
 
  useEffect(() => {

    if (map === null && isCRSLoading === false && isLoading === false){
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        // style: 'mapbox://styles/mapbox/streets-v12',
        center:mapinfo.center ,
        zoom: 14
      });
  
      map.addControl(new mapboxgl.NavigationControl());
  
      initMAP(map, targetpolygons, targetpoints, selectedBoxpoly,coursepoly,  holepoly);

      console.log("MAP INIT Done!!")
      setMap(map);
      setMode('MAPReview');
      // setCourse('MGC000');
      // setCRS('전코스')
      // setHole(0)
      setEdited(false)
      // setMapBearing(0)
    }





    return () => {
      if(map !== null) map.remove();
      setMap(null)
      setDraw(null)
      setMode('MenuSelect')
      console.log("Map Close Function Called", map)
    }
  }, [isCRSLoading, isLoading]);

  useEffect(() => {
    if (selected_course === "MGC000"){
      setCRS('전코스')
      setHole(0)
      setBoxPoly({...mapboxini_poly})
      return
    }    
  },[selected_course]);


  useEffect(() => {
    // console.log("BOXPoly CHanged", selectedBoxpoly)
    // BOXpoly가 변할때마다, MAP의 Boundary를 BOX 폴리에 맞게 변경 

    if (map !== null && typeof map !== 'undefined' ){
      let bbox_ =turfbbox(selectedBoxpoly.data);
      // map.rotateTo(30);
      map.fitBounds(bbox_, {bearing:mapbearing, padding: 5});
      console.log("BOXpoly Set", map.getSource('BoxArea'))

        if (map.getSource('BoxArea') !== null && selected_course !== "MGC000" && typeof map.getSource('BoxArea') !== 'undefined') 
            {
              map.getSource('BoxArea').setData({...selectedBoxpoly.data});
            }
    }

  },[selectedBoxpoly]);


  useEffect(() => {
    if (selected_course === "MGC000")  return
    if (map === null) return

    // console.log('HolePoly is ready', holepoly)

    if (typeof(map.getSource('selected-course-hole')) !== 'undefined' && selected_course !== "MGC000") 
      map.getSource('selected-course-hole').setData({...holepoly.data});
  },[holepoly]);

  useEffect(() => {
    if (selected_course === "MGC000")  return
    if (map === null) return

    // console.log('CoursePoly is ready', {...coursepoly.data.features.filter((x)=>x.properties.TypeId === 2)})

    if (typeof(map.getSource('selected-course-CRS')) !== 'undefined' && selected_course !== "MGC000") 
      map.getSource('selected-course-CRS').setData({...coursepoly.data, features:coursepoly.data.features.filter((x)=>x.properties.TypeId === 2)});
  },[coursepoly]);



  useEffect(() => {

    if(map === null) return;
// All color of target polygons is set back to normal
    if( targetpolygons.data !== undefined)     
      targetpolygons.data.features.forEach((x)=>
        map.setFeatureState({
          source: 'Target-Area',
          id: x.id, 
        }, {
          click: false
        })
      )

    if (selected_polygon === null ) return

    map.setFeatureState({
      source: 'Target-Area',
      id: selected_polygon.id, 
    }, {
      click: true
    });


  },[selected_polygon]);



  const handle_editpolygonChange = () =>{

    if(draw === null) return
    // draw.changeMode("direct_select")
    
    if (draw.getSelected().features.length>0) setPolyGon( {...draw.getSelected().features[0]}  );

    // console.log('Selected in drawMode',draw.getSelected())
  }

  const handle_editpolygonNewUpdate = (e) =>{
    /* This function will be called if  */

    if(draw === null) return
    // draw.changeMode("direct_select")
    let data_= draw.getAll()
    
    // let created_ = data_.features[data_.features.length - 1]
    let created_ = {...e.features[0]} // Created 된 객체를 직접 Event에서 받는다.

    console.log('Before Created Procerss:',created_.geometry.type,turfcentroid(created_), data_, e.action)

    if(e.action !== 'move' && e.action !=='change_coordinates'){

      let polygon_info_ini = {}
      let new_id = uuidv4()
      let search_holepoly = check_CRSandHole(turfcentroid(created_), holepoly, coursepoly)
      let polgygon_coordinates = created_.geometry.type === 'Point'? createGeoJSONCircle(created_.geometry.coordinates, 4/1000.):created_.geometry.coordinates

      polygon_info_ini = {
        ...search_holepoly[0],
        geometry:{...search_holepoly[0].geometry, coordinates: [...polgygon_coordinates]
        }, 
        id:created_.id,
        properties:{ ...search_holepoly[0].properties,          
          Id:created_.id, 
          Type:created_.geometry.type === 'Point'?"관심포인트":"관심영역", 
          TypeId:created_.geometry.type === 'Point'? 11:10,
          radius:created_.geometry.type === 'Point'? 4:0,
          center:created_.geometry.type === 'Point'? created_.geometry.coordinates:turfcentroid(created_).geometry.coordinates,
          Valid: true, By: loginuser, When: (new Date()).toISOString(), Client: selected_course_info.name,
          Labels:[label_single]
        
        }
      }
      console.log("New Polygon Created", polygon_info_ini )
      setPolyGon( {...polygon_info_ini}  );

      let new_data = {...data_, features: [...data_.features.filter((x)=>x.id !== created_.id) ,polygon_info_ini ] } // 폴리건의 위치 정보 홀정보등이 들어가여 함으로...
      console.log("New Polygon Created", new_data )
      draw.set(new_data)// Delete All and Add All


    }

  }

  useEffect(() => {

    console.log( ' Redrawing Called')

    if (selected_mode === 'MenuSelect') setBoxPoly({...mapboxini_poly})

    if (selected_mode === "MAPReview")  setBoxPoly({...selectedBoxpoly})

    if(map === null) return;
    let draw_= null;
    if(draw === null){
      draw_ = new MapboxDraw({
        displayControlsDefault: false,
        // Select which mapbox-gl-draw control buttons to add to the map.
        controls: {
        polygon: true,
        point:true,
        trash: true
        },
        // Set mapbox-gl-draw to draw by default.
        // The user does not have to click the polygon control button first.
        defaultMode: 'simple_select',
// 
        // defaultMode: 'draw_polygon'
        });        
        setDraw(draw_)

        console.log('Draw Init')
    }



    if (selected_mode === "MAPGEOJSONEDIT" && draw !== null) {
      
      map.addControl(draw);
      map.on('draw.selectionchange',handle_editpolygonChange);
      map.on('draw.create',handle_editpolygonNewUpdate);
      map.on('draw.update', handle_editpolygonNewUpdate);

      map.setLayoutProperty('Target_Area', 'visibility', 'none');
      map.setLayoutProperty('Target_Point', 'visibility', 'none');
      map.setLayoutProperty('Target_Area_borders', 'visibility', 'none');
      draw.deleteAll()
      draw.add({...targetpolygons.data})
      // draw.add({...targetpoints.data})
    
      setEdited(true)
    
    }
    if (selected_mode === "MAPReview"&& draw !== null && draw !== undefined && edited === true) {
      console.log("ALL Data:", draw.getAll())

      let dataFromDraw = draw.getAll();

      let PointObjects = dataFromDraw.features.filter((x)=>  x.properties.TypeId ===11).map((circleASpolygon) => {
        return {...circleASpolygon, geometry: {...circleASpolygon.geometry, coordinates:turfcentroid(circleASpolygon).geometry.coordinates, type:'Point'}}
      })

      console.log(dataFromDraw)
      setGeoJsonInfo(
        {...geojsoninfo, 
          features:[...dataFromDraw.features.filter((x)=>  x.properties.TypeId ===10), 
            ...PointObjects
          ].sort((a, b) =>  
            baseinfo.area_def.filter((x)=>x.name ===a['properties'].Type)[0].DSZindex - 
            baseinfo.area_def.filter((x)=>x.name ===b['properties'].Type)[0].DSZindex)
        }
      )
      draw.deleteAll()
      map.off('draw.selectionchange',handle_editpolygonChange);
      map.off('draw.create',handle_editpolygonNewUpdate);
      map.off('draw.update', handle_editpolygonNewUpdate);
      map.removeControl(draw);

      map.setLayoutProperty('Target_Area', 'visibility', 'visible');
      map.setLayoutProperty('Target_Point', 'visibility', 'visible');
      map.setLayoutProperty('Target_Area_borders', 'visibility',  'visible');
      setEdited(false)


    }
  },[selected_mode]);

  useEffect(() => {
    /*  
    geojson object Update 될떄 마다 Tpoly를 업데이트 target polygons and point 는 DSMAP data에서 Tpoly는 여기서 (selected CRS and hole 때문에)
    All geomrty type of all Tpoly are polygons regardless of Point or Polygon. However the actual geojson data that should be sync with DB is Point and Polygon
    As such, if polygon type in geojson should go to Tploy without any modificiation.
    If point, Tpoly shouls be chanred to Polygon with Circle based on diameter.
    
    The same process is done for targetpolygonns and targetpoint in DSMapData.js
    
    */

    if(map === null|| isLoading === true) return;

    let geojsondata_ = geojsoninfo['features'].sort((a, b) =>  baseinfo.area_def.filter((x)=>x.name ===a['properties'].Type)[0].DSZindex - 
      baseinfo.area_def.filter((x)=>x.name ===b['properties'].Type)[0].DSZindex)

    let targetpolygons_ = [];

    targetpolygons_ = geojsondata_.filter((poly_)=>poly_['properties'].TypeId === 10 && poly_['properties'].Valid !== false).map((geojson_)=> {
      // return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon', coordinates: [[...geojson_['geometry']['coordinates'][0], geojson_['geometry']['coordinates'][0][0]]]}}
      return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon'}}
    })
    
    let tcircle_poly_ = geojsondata_.filter((poly_)=>poly_['properties'].TypeId ===11 && poly_['properties'].Valid !== false).map((geojson_)=> {
      return {...geojson_, geometry: {...geojson_['geometry'], 'type': 'Polygon', coordinates:createGeoJSONCircle(geojson_.geometry.coordinates, geojson_.properties.radius/1000.)}}
    })

    targetpolygons_ = [...targetpolygons_, ...tcircle_poly_]

    let tpoly_ = [];
  
    if (selected_CRS === '전코스'){  
      if(targetpolygons_.length > 0) targetpolygons_.map((geojson_)=>{
          tpoly_.push(geojson_)      
        })  
    }  
    else{  

      if(targetpolygons_.length > 0)  
        if(selected_hole !==0 )
          targetpolygons_.filter((polyg_)=> Number(polyg_['properties'].Hole) === Number(selected_hole) 
            && polyg_['properties'].Course === selected_CRS).forEach((geojson_)=>{tpoly_.push(geojson_)})
        else
          targetpolygons_.filter((polyg_)=> polyg_['properties'].Course === selected_CRS).forEach((geojson_)=>{tpoly_.push(geojson_)})  
    } 

    console.log('Tpoly Updated', tpoly_)
    setTPoly([...tpoly_])



  },[geojsoninfo]);


  useEffect(() => {
  /* 
    Intialize Mapbox Target Area based on the updaates of  targetpolygon 
    Set event callback function 
      1. Check if any polygon in tpoly was selected. If not set selected polygon to be Null
      2. Update selected_polgon infomation from targetpolygons that matches id
    
  */


    //따라서 각 폴리건의 초기화 즉 클릭하면 실향되는 evemt Function으로 초기화
    if (map !== null){

      console.log('Target Polygon Updated',targetpolygons)

      if (map.getSource('Target-Area') != null && selected_course !== "MGC000") map.getSource('Target-Area').setData({...targetpolygons.data});
      // console.log('targetpolygons', JSON.stringify(targetpolygons.data))
      // MAPBOX Event Function called when any polgons is selected. Set selected_polgon as the clicked ploygons
      let polygonID = null;

      map.on('click', (e) => {
        if (targetpolygons.data.features.length === 0 || typeof targetpolygons === 'undefined') return

        let pt = turfpoint([e.lngLat.lng, e.lngLat.lat])
        if (targetpolygons.data.features.filter((x)=> booleanPointInPolygon(pt, x)).length === 0) setPolyGon(null)
        });

      map.on('click','Target_Area',  (e) => {
        const coordinates = e.features[0].geometry.coordinates[0][0];
        const description = '<strong>'+e.features[0].properties.Course+' '+ e.features[0].properties.Hole+
        '홀</strong><p>'+e.features[0].properties.Desc+'</p>' 

        // new mapboxgl.Popup()
        // .setLngLat(coordinates)
        // .setHTML(description)
        // .addTo(map);
        let selected_polygons_ = targetpolygons.data.features.filter((x) => x.id === e.features[0].properties.Id)
        // console.log('Event Click in Target Area', targetpolygons.data.features.filter((x) => x.id === e.features[0].properties.Id))

        if (selected_polygons_.length> 0) setPolyGon({...selected_polygons_[0]})          

      });
    }

  },[targetpolygons, map]);

  useEffect(() => {
  /* 
    Intialize Mapbox Target Point based on the updaates of  targetpoints
    TargetPoints is visulation only... No event function is required
    
  */
    if (map !== null){
      if (map.getSource('Target-Point') != null && selected_course !== "MGC000") 
        map.getSource('Target-Point').setData({...targetpoints.data});
    }

  },[targetpoints]);


  useEffect(() => {
    // User가 코스와 홀을 변경할떄마다 불려지는 함수.
    // 코스가 전코스 일때는, Box폴리와 tpoly를 전체로다...
    
    if (Object.keys(coursepoly).length === 0 || Object.keys(holepoly).length ===0 || map === null) return

    let selected_boxpoly_ = {};
    let selected_greenpoly_ = null;
    let tpoly_ = [];
    let bearing_ =0;

    if (selected_CRS === '전코스'){
      selected_boxpoly_ = coursepoly.data.features.filter((x) => x.properties.Course === selected_CRS)[0]

      // console.log(targetpolygons)

      if(isLoading === false && targetpolygons['data']['features'].length > 0)
        targetpolygons['data']['features'].map((geojson_)=>{
          tpoly_.push(geojson_)      
        })

    }

    else{

      selected_boxpoly_ = selected_hole === 0? 
        coursepoly.data.features.filter((x) => x.properties.Course === selected_CRS)[0]:
        holepoly.data.features.filter((x) => x.properties.Hole === selected_hole && x.properties.Course === selected_CRS )[0]
      selected_greenpoly_ = selected_hole === 0? 
        null:
        greenpoly.data.features.filter((x) => x.properties.Hole === selected_hole && x.properties.Course === selected_CRS )[0]

      // tpoly에 work polygons 중 해당되는 것만 ....

      if(isLoading === false && targetpolygons['data']['features'].length > 0)
        // work polygons 중에서 해당 

        if(selected_hole !==0 )
          targetpolygons['data']['features'].filter((polyg_)=> Number(polyg_['properties'].Hole) === Number(selected_hole) 
            && polyg_['properties'].Course === selected_CRS).forEach((geojson_)=>{tpoly_.push(geojson_)})
        else
          targetpolygons['data']['features'].filter((polyg_)=> polyg_['properties'].Course === selected_CRS).forEach((geojson_)=>{tpoly_.push(geojson_)})
          
  
      //  console.log(geojson_mode)

    }

    setBoxPoly({
      'type': 'geojson',
      'data': {...selected_boxpoly_} 
    })

    setTPoly([...tpoly_])

    if (selected_greenpoly_ !== null && typeof selected_greenpoly_ !== 'undefined')
      bearing_ = turf.bearing(turf.centerOfMass(selected_boxpoly_),turf.centerOfMass(selected_greenpoly_))
    setMapBearing(bearing_)

  },[selected_CRS, selected_hole]);


 
  return (
    <Fragment>

      <Stack direction="row" spacing={0}   justifyContent="center"  alignItems="center" mt = {1}> 
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
      <Box height="60vh" sx={{ p: 0, border: '1px solid gray',gap: 0, borderRadius: 0 , m: 1}}>
        <div ref={mapContainer} className="map-container" />
      </Box>
      <DSAreaPicker/>
    </Fragment>

  );
}