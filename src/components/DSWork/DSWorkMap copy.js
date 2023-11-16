import React, { useRef, useEffect, useState, useContext , Fragment} from 'react';
import { Box, Button, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress} from '@mui/material';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { BaseContext, MapQContext, MapCRSQContext} from "../../context"
import {createGeoJSONCircle} from "../DSBasics/DSCordUtils.js";
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, bbox as turfbbox ,centroid as turfcentroid} from "@turf/turf";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import * as turf from "@turf/turf";

import './Map.css';


import { BASEURL,  MAPBLANK, MAPINFO_INI, COURSEBLANK,POLYGONBLANK,  GEOJSONBLANK, MAPBOXINI, INTERESTED_POLYGONBLANK, INTERESTED_POINT } from '../../constant/urlconstants';
import { ContactPageSharp } from '@mui/icons-material';


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
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      // style: 'mapbox://styles/mapbox/streets-v12',
      center:mapinfo.center ,
      zoom: 14
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', function () {

      map.addSource('Target-Area', {
        'type': 'geojson',
        'data': {},
        // 'generateId':true              
        'promoteId':'Id'
      });    
      map.addLayer({
        'id': 'Target_Area',
        'type': 'fill',
        'source': 'Target-Area',
        'paint': {
        'fill-color': "#B42222",
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'click'], false],
          1,
          0.2
          ]
        },
        'filter': ['==', '$type', 'Polygon']
        });
      map.addLayer({
        'id': 'Target_Area_borders',
        'type': 'line',
        'source': 'Target-Area',
        'layout': {},
        'paint': {
            'line-color': '#B42222',
            'line-width': 2
        }
      });

        map.addSource('Target-Point', {
          'type': 'geojson',
          'data': { }              
        });    
        map.addLayer({
          'id': 'Target_Point',
          'type': 'circle',
          'source': 'Target-Point',
          'paint': {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-opacity': 0.4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
            },
          'filter': ['==', '$type', 'Point']
          }, 'Target_Area');



      map.addSource('BoxArea', 
      {
        'type': 'geojson',
        'data': { }  
      });        
      map.addLayer({
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

      map.addSource('selected-course-hole',       {
        'type': 'geojson',
        'data': { }  
      });   
      map.addLayer({
        'id': 'selected-course-hole',
        'type': 'symbol',
        'source': 'selected-course-hole',
        "paint": {
          "text-color": "#ffd500"
        },
        'layout': {
          'text-field': [
            'format',
            // ['upcase', ['get', 'Course']],
            // { 'font-scale': 0.8 },
            ['get', 'Hole'],
            { 'font-scale': 0.8 }
          ],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold']
          
          }
        });

        map.addSource('selected-course-CRS',       {
          'type': 'geojson',
          'data': {}  
        });   
        map.addLayer({
          'id': 'selected-course-CRS',
          'type': 'symbol',
          'source': 'selected-course-CRS',
          "paint": {
            "text-color": "#ffd500"
          },
          'layout': {
            'text-field': [
              'format',
              ['get', 'Course'],
              { 'font-scale': 0.8 },

            ],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold']
            }
          });

    });

    setMap(map);
    setMode('MAPSelect');
    setCourse('MGC000');
    setEdited(false)

    return () => {setMode('MAPSelect');setCourse('MGC000');map.remove();setMap(null)}
  }, []);

  useEffect(() => {
    if (selected_course === "MGC000"){
      setCRS('전코스')
      setHole(0)
      setBoxPoly({...mapboxini_poly})
      return
    }

    // if (typeof(map.getSource('selected-course-hole')) !== undefined && selected_course !== "MGC000") map.getSource('selected-course-hole').setData({...holepoly.data});
  },[selected_course]);


  useEffect(() => {
    // console.log("BOXPoly CHanged", selectedBoxpoly)
    // BOXpoly가 변할때마다, MAP의 Boundary를 BOX 폴리에 맞게 변경 

    if (map !== null && map !== undefined){
      let bbox_ =turfbbox(selectedBoxpoly.data);
      // map.rotateTo(30);
      map.fitBounds(bbox_, {bearing:mapbearing, padding: 5});

        if (map.getSource('BoxArea') !== null && selected_course !== "MGC000") map.getSource('BoxArea').setData({...selectedBoxpoly.data});
    }

  },[selectedBoxpoly]);


  useEffect(() => {
    if (selected_course === "MGC000")  return
    if (map === null) return

    // console.log('HolePoly is ready', holepoly)

    if (typeof(map.getSource('selected-course-hole')) !== undefined && selected_course !== "MGC000") map.getSource('selected-course-hole').setData({...holepoly.data});
  },[holepoly]);

  useEffect(() => {
    if (selected_course === "MGC000")  return
    if (map === null) return

    // console.log('CoursePoly is ready', {...coursepoly.data.features.filter((x)=>x.properties.TypeId === 2)})

    if (typeof(map.getSource('selected-course-CRS')) !== undefined && selected_course !== "MGC000") 
      map.getSource('selected-course-CRS').setData({...coursepoly.data, features:coursepoly.data.features.filter((x)=>x.properties.TypeId === 2)});
  },[coursepoly]);



  useEffect(() => {

    if(map === null) return;

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

    // All color of target polygons is set back to normal and change selected polygon to highlighted

    targetpolygons.data.features.forEach((x)=>
      map.setFeatureState({
        source: 'Target-Area',
        id: x.id, 
      }, {
        click: false
      })
    )

    map.setFeatureState({
      source: 'Target-Area',
      id: selected_polygon.id, 
    }, {
      click: true
    });




    // if(selected_polygon.properties.TypeId === 11){

    //   console.log("IN MAP",selected_polygon.properties.radius)

    //   let polgygon_coordinates = createGeoJSONCircle(selected_polygon.properties.center, selected_polygon.properties.radius/1000.)

    
    //   let polygon_info_ini = {
    //     ...selected_polygon,
    //     geometry:{...selected_polygon.geometry, coordinates: [...polgygon_coordinates]
    //     }
    //   }

    //   if (selected_mode === "MAPGEOJSONEDIT"){
    //   let data_= draw.getAll()
    //   let new_data = {...data_, features: [...data_.features.filter((x)=>x.properties.Id !== selected_polygon.properties.Id) ,polygon_info_ini ] } // 폴리건의 위치 정보 홀정보등이 들어가여 함으로...

    //   draw.set(new_data)// Delete All and Add All
    //   }
    //   else{
    //     setTargetPolygons({
    //       'type': 'geojson',
    //       'data': {
    //         ...targetpolygons.data, features: [...targetpolygons.data.features.filter((x)=>x.properties.Id !== selected_polygon.properties.Id) ,polygon_info_ini ]
    //       }              
    //     })

    //   }
    // }
      // if(selected_polygon.properties.TypeId === 10){

      //   console.log("IN MAP",selected_polygon.properties.TypeId , selected_polygon)
      //   let polygon_info_ini = {
      //     ...selected_polygon
      //   }
  
      //   if (selected_mode === "MAPGEOJSONEDIT"){
      //   let data_= draw.getAll()
      //   let new_data = {...data_, features: [...data_.features.filter((x)=>x.properties.Id !== selected_polygon.properties.Id) ,polygon_info_ini ] } // 폴리건의 위치 정보 홀정보등이 들어가여 함으로...
  
      //   draw.set(new_data)// Delete All and Add All
      //   }
        // else{
        //   setTargetPolygons({
        //     'type': 'geojson',
        //     'data': {
        //       ...targetpolygons.data, features: [...targetpolygons.data.features.filter((x)=>x.properties.Id !== selected_polygon.properties.Id) ,polygon_info_ini ].sort((a,b) => a.TypeId - b.TypeId)
        //     }              
        //   })
  
        // }
      // }


  },[selected_polygon]);



  const handle_editpolygonChange = () =>{

    if(draw === null) return
    // draw.changeMode("direct_select")
    
    if (draw.getSelected().features.length>0) setPolyGon( {...draw.getSelected().features[0]}  );

    console.log('Selected in drawMode',draw.getSelected())
  }

  const check_CRSandHole = (pnt_) =>
  {
    let search_holepoly = holepoly.data.features.filter((x)=> booleanPointInPolygon(pnt_, turfpolygon(x.geometry.coordinates)))

    if (search_holepoly.length === 0) search_holepoly = coursepoly.data.features.filter((x)=> 
        booleanPointInPolygon(pnt_, turfpolygon(x.geometry.coordinates)) && x.properties.Course !=='전코스')

    if (search_holepoly.length === 0) search_holepoly = coursepoly.data.features.filter((x)=> 
        booleanPointInPolygon(pnt_, turfpolygon(x.geometry.coordinates)) && x.properties.Course ==='전코스')
    
    if (search_holepoly.length === 0) search_holepoly = [JSON.parse(JSON.stringify(INTERESTED_POLYGONBLANK))];

    return search_holepoly
  }

  const handle_editpolygonNewUpdate = (e) =>{

    if(draw === null) return
    // draw.changeMode("direct_select")
    let data_= draw.getAll()
    
    // let created_ = data_.features[data_.features.length - 1]
    let created_ = {...e.features[0]} // Created 된 객체를 직접 Event에서 받는다.

    console.log('Before Created Procerss:',created_.geometry.type,turfcentroid(created_), data_, e.action)

    let geo_type_ = created_.geometry.type === 'Point'?'Point':(created_.properties.TypeId === 11?'Point':'Polygon')
    let geo_type_center = created_.geometry.type === 'Point'?created_.geometry.coordinates:(created_.properties.TypeId === 11?
      turfcentroid(created_).geometry.coordinates:[])
    let geo_type_radius = created_.geometry.type === 'Point'?4:(created_.properties.TypeId === 11? created_.properties.radius:0)
    let polgygon_coordinates = created_.geometry.type === 'Point'? createGeoJSONCircle(created_.geometry.coordinates, 4/1000.):
      (created_.properties.TypeId === 11?createGeoJSONCircle(geo_type_center, created_.properties.radius/1000.):created_.geometry.coordinates)

    
    let polygon_info_ini = {}
    let search_holepoly = check_CRSandHole(turfcentroid(created_)) // 만들어진 객체의 현재 홀 객체를 받음.



    polygon_info_ini = {
      ...search_holepoly[0],
      geometry:{...search_holepoly[0].geometry, coordinates: [...polgygon_coordinates]
      }, 
      id:created_.id,
      properties:{ ...search_holepoly[0].properties,Id:uuidv4(), 
        Type:geo_type_ === 'Point'?"관심포인트":"관심영역", 
        TypeId:geo_type_ === 'Point'? 11:10,
        radius:geo_type_radius,
        center:geo_type_center,
        Valid: true, By: loginuser, When: (new Date()).toISOString(), Client: selected_course_info.name}
    }

    // console.log(polygon_info_ini)
    setPolyGon( {...polygon_info_ini}  );

    let new_data = {...data_, features: [...data_.features.filter((x)=>x.id !== created_.id) ,polygon_info_ini ] } // 폴리건의 위치 정보 홀정보등이 들어가여 함으로...

    draw.set(new_data)// Delete All and Add All

    console.log('Created:',polygon_info_ini, new_data)
  }

  useEffect(() => {

    if(map === null) return;
    if(draw === null){
      const draw_ = new MapboxDraw({
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
    }

    if (selected_mode === "MAPSelect") setBoxPoly({...mapboxini_poly})

    if (selected_mode === "MAPGEOJSONEDIT") {
      
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
    if (selected_mode === "MAPEdit"&& draw !== null && draw !== undefined && edited === true) {
      console.log("ALL Data:", draw.getAll())

      setTargetPolygons({
        'type': 'geojson',
        'data': {
          ...draw.getAll()
        }              
      })

      let PointObjects = draw.getAll().features.filter((x)=>  x.properties.TypeId ===11).map((circleASpolygon) => {
        return {...circleASpolygon, geometry: {...circleASpolygon.geometry, coordinates:circleASpolygon.properties.center, type:'Point'}}
      })

      console.log(PointObjects)

      setTargetPoints({
        'type': 'geojson',
        'data': {
          ...draw.getAll(), features:[...PointObjects]
        }              
      })


      
      setGeoJsonInfo(
        {...geojsoninfo, 
          features:[...geojsoninfo.features.filter((x) => x.properties.TypeId <10),
            ...draw.getAll().features.filter((x)=>  x.properties.TypeId ===10), 
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
    // DSMAPDATA에서 geojson 이 최종적으로 로드가 완료되면 실행되는 함수,
    //따라서 각 폴리건의 초기화 즉 클릭하면 실향되는 evemt Function으로 초기화
    if (map !== null){

      // if (selected_CRS === '전코스'){

      //   let tpoly_ = []
  
      //   if(isLoading === false && targetpolygons['data']['features'].length > 0)
      //     targetpolygons['data']['features'].forEach((geojson_)=>{
      //       tpoly_.push(geojson_)      
      //     })

      //   setTPoly([...tpoly_])
  
      // }

      if (map.getSource('Target-Area') != null && selected_course !== "MGC000") map.getSource('Target-Area').setData({...targetpolygons.data});
      // console.log('targetpolygons', JSON.stringify(targetpolygons.data))
      // MAPBOX Event Function called when any polgons is selected. Set selected_polgon as the clicked ploygons
      let polygonID = null;

      map.on('click', (e) => {

        let pt = turfpoint([e.lngLat.lng, e.lngLat.lat])
        if (tpoly.filter((x)=> booleanPointInPolygon(pt, x)).length === 0) setPolyGon(null)
        });

      map.on('click','Target_Area',  (e) => {
        const coordinates = e.features[0].geometry.coordinates[0][0];
        const description = '<strong>'+e.features[0].properties.Course+' '+ e.features[0].properties.Hole+
        '홀</strong><p>'+e.features[0].properties.Desc+'</p>' 

        // new mapboxgl.Popup()
        // .setLngLat(coordinates)
        // .setHTML(description)
        // .addTo(map);


        setPolyGon(            {
          "type": "Feature",
          "id":e.features[0].properties.Id,
          "properties":{...e.features[0].properties,center:JSON.parse(e.features[0].properties.center), Labels:JSON.parse(e.features[0].properties.Labels)},
          "geometry": {
            "type": "Polygon",
            "coordinates": e.features[0].geometry.coordinates
          }
        })        
        

      });
    }

  },[targetpolygons]);

  useEffect(() => {
    // DSMAPDATA에서 geojson 이 최종적으로 로드가 완료되면 실행되는 함수,
    //따라서 각 폴리건의 초기화 즉 클릭하면 실향되는 evemt Function으로 초기화
    if (map !== null){
      if (map.getSource('Target-Point') != null && selected_course !== "MGC000") map.getSource('Target-Point').setData({...targetpoints.data});
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

    if (selected_greenpoly_ !== null && selected_greenpoly_ !== undefined)
      bearing_ = turf.bearing(turf.centerOfMass(selected_boxpoly_),turf.centerOfMass(selected_greenpoly_))
    setMapBearing(bearing_)

  },[selected_CRS, selected_hole]);


 
  return (
    <Fragment>

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
      {/* <Box height="90vh" sx={{ p: 0, border: '1px solid gray',gap: 0, borderRadius: 0 , m: 1}}> */}
        <div ref={mapContainer} className="map-container" />
      {/* </Box> */}
    </Fragment>

  );
}