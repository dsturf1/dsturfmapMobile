import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { Map, MapMarker, ZoomControl, MapTypeControl,StaticMap, Polygon, DrawingManager, Toolbox} from 'react-kakao-maps-sdk';
import { Box, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, List, ButtonGroup ,Button} from '@mui/material';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import saveAs from "file-saver";
import  {ds_mgrData2kakao, ds_geojson2kakao, ds_mgrData2geojson, ds_geojson2kakaoV2}from "../DSBasics/DSCordUtils.js"

import { BaseContext, MapQContext, MapCRSQContext} from "../../context"
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { BASEURL,  MAPBLANK, MAPINFO_INI, COURSEBLANK,POLYGONBLANK, INTERESTED_POLYGONBLANK } from '../../constant/urlconstants';
// import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { point as turfpoint, polygon as turfpolygon, lineString as turfline, booleanPointInPolygon, centroid as turfcentroid} from "@turf/turf";
import * as turf from "@turf/turf";

const DSGeoJsonMap = ({geojson_mode}) => {

  const {CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, CRStpoly, setCRSTPoly,  
    holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, 
    selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo,selected_polygon, setPolyGon} = useContext(BaseContext);

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
    // console.log("ATMAP", geojson_mode)
  }, [selected_course, CRSgeojsoninfo])


  return (
    <Fragment>      
      <Box height="100%" sx={{ position:'relative', p: 0, border: '1px solid gray',gap: 0, borderRadius: 0 , m: 0}}>
        <Map 
          center={{lat:mapinfo.center[1], lng:mapinfo.center[0]}}
          style={{
            width: "100%",
            height: "100%",
          }}
          level={mapinfo.level}
          ref={mapRef}
          onClick={(_t, mouseEvent) => {
            // Mouse Click 이 아무 폴리건도 선택되지 않은 경우에는 선택된 폴리건 을 Null
            // 다만, GEOJSONEDIT 모드에서는 폴리건 선택 해제를 못하게...
          let pt = turfpoint([mouseEvent.latLng.getLng(), mouseEvent.latLng.getLat()])
          if (CRStpoly.filter((x)=> booleanPointInPolygon(pt, x)).length === 0 && selected_mode !== 'MAPGEOJSONEDIT') setPolyGon(null)

          }}
          onBoundsChanged={(map) => setMapInfo({center: [map.getCenter().getLng(),map.getCenter().getLat()],level:map.getLevel(),
            bounds:{
              sw: [map.getBounds().getSouthWest().getLng(), map.getBounds().getSouthWest().getLat()],
              ne: [map.getBounds().getNorthEast().getLng(), map.getBounds().getNorthEast().getLat()]
            }
          })
        }>
          <MapTypeControl />
          <DSPolyEdit/>
          {selected_mode === "MAPGEOJSONEDIT"? null: <DSPolyGons geojson_mode = {geojson_mode}/>}
        </Map>
      </Box>
    </Fragment>
  )
}

export default DSGeoJsonMap;

function DSPolyGons({geojson_mode}){


  const {CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, CRStpoly, setCRSTPoly,  
    holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser,
     selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo} = useContext(BaseContext);

  useEffect(() => {

    let tpoly_ = [];

    if(isCRSLoading === false && CRSgeojsoninfo['features'].length > 0)
      // 선택된 폴리건의 Type이 display가 on된 상태에만 Tpoly에 업로드
      CRSgeojsoninfo['features'].filter((polyg_)=> baseinfo.area_def.filter((x)=>x.name ===polyg_['properties'].Type)[0].display)
        .map((geojson_)=>{
      // tpoly_.push(turfpolygon(geojson_['geometry']['coordinates']))
      tpoly_.push(geojson_)
      
      })

     console.log(CRSgeojsoninfo)
     setCRSTPoly([...tpoly_])

  }, [baseinfo.area_def, CRSgeojsoninfo])
  

  return(
    <>
        {isCRSLoading === false && CRSgeojsoninfo['features'].length > 0 ?
          CRSgeojsoninfo['features'].filter((polyg_)=> baseinfo.area_def.filter((x)=>x.name ===polyg_['properties'].Type)[0].display 
          ).map((geojson_)=>{
          
            return <DSPolyGon 
              key = {geojson_['properties'].Id}
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

  const {CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, CRStpoly, setCRSTPoly,  
    holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_polygon, setPolyGon} = useContext(BaseContext);
  const [isMouseOver, setIsMouseOver] = useState(false)

  return(
    <>
      <Polygon 
        path = {ds_geojson2kakao(geojson_path)}
        key={geojson.properties.Id}
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
          // console.log(_polygon.getPath())
        }}
      />            
    </>
  )
}


function DSPolyEdit(){

  const {CRSgeojsoninfo, setCRSGeoJsonInfo, isCRSLoading, setIsCRSLoading, CRStpoly, setCRSTPoly,  
    holepoly, setHolePoly, coursepoly, setCoursePoly,selectedBoxpoly, setBoxPoly} = useContext(MapCRSQContext);
  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, 
    loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId,mapinfo, setMapInfo, selected_polygon, setPolyGon,selected_course_info, setSelectedCourseInfo} = useContext(BaseContext);

  const managerRef = useRef(null)
  const [local_mode, setLocalMode] = useState('DSMAPGEOJSON_INI')
  const { kakao } = window;  

  const [undoable, setUndoable] = useState(false)
  const [redoable, setRedoable] = useState(false)


  const undo = () => {
    const manager = managerRef.current
    manager.undo()
  }

  const redo = () => {
    const manager = managerRef.current
    manager.redo()
  }

  function selectOverlay(type) {
    const manager = managerRef.current
    manager.cancel()
    manager.select(type)
  }

  useEffect(() => {
    console.log('MODECHANGED TO', selected_mode, local_mode)

    if (selected_mode === "MAPGEOJSONEDIT") {

      setRedoable(managerRef.current.redoable())
      setUndoable(managerRef.current.undoable())

      if (local_mode === 'DSMAPGEOJSON_ADD') {
        // managerRef.current.cancel()
        selectOverlay(kakao.maps.drawing.OverlayType.POLYGON)
      }
      


      if (local_mode === 'DSMAPGEOJSON_INI' && selected_polygon !== null) {
        managerRef.current.setStyle(kakao.maps.drawing.OverlayType.POLYGON, 'draggable',1);
        managerRef.current.setStyle(kakao.maps.drawing.OverlayType.POLYGON, 'removable',1);
        managerRef.current.setStyle(kakao.maps.drawing.OverlayType.POLYGON, 'editable',1);
        managerRef.current.put(kakao.maps.drawing.OverlayType.POLYGON, ds_geojson2kakaoV2(selected_polygon['geometry']['coordinates'][0]))
      }

      // if (local_mode === 'DSMAPGEOJSON_SIM') {
      //   console.log('LOCALMODE',local_mode)
      //   // managerRef.current.cancel()
      //   // if (managerRef.current.getOverlays().polygon.length >0) {
      //   //   managerRef.current.remove(managerRef.current.getOverlays().polygon[0]);
      //   //   }
      //   var options = {tolerance: 0.00005, highQuality: true};
      //   var simplified = turf.simplify(selected_polygon, options);
      //   // var simplified = turf.polygonSmooth(selected_polygon, {iterations: 3})

      //   console.log(selected_polygon, simplified)

      //   managerRef.current.put(kakao.maps.drawing.OverlayType.POLYGON, ds_geojson2kakaoV2(simplified['geometry']['coordinates'][0]))


      // }

      if (local_mode === 'DSMAPGEOJSON_CUT') {
        console.log('LOCALMODE',local_mode)
        managerRef.current.cancel()
        if (managerRef.current.getOverlays().polygon.length >0) {
          managerRef.current.remove(managerRef.current.getOverlays().polygon[0]);
          }


        managerRef.current.setStyle(kakao.maps.drawing.OverlayType.POLYGON, 'draggable',0);
        managerRef.current.setStyle(kakao.maps.drawing.OverlayType.POLYGON, 'removable',0);
        managerRef.current.setStyle(kakao.maps.drawing.OverlayType.POLYGON, 'editable',0);
        managerRef.current.put(kakao.maps.drawing.OverlayType.POLYGON, ds_geojson2kakaoV2(selected_polygon['geometry']['coordinates'][0]))
        selectOverlay(kakao.maps.drawing.OverlayType.POLYLINE)

      }

      if (local_mode === 'DSMAPGEOJSON_CUTLINE_END') {
        console.log('LOCALMODE',local_mode)

        cutPolygon()
        setPolyGon(null)
        setMode('MAPEdit')

      }
    }

    if (selected_mode === "MAPEdit" && managerRef.current!== null) {

      managerRef.current.cancel();

      let polygon_in_mgr = managerRef.current.getData();

      console.log("Manager Polygon", polygon_in_mgr)


      let new_polygons = [];

      polygon_in_mgr.polygon.forEach((poly_) => {

        let polygon_info_ini = {}

        let tmp = ds_mgrData2geojson(poly_.points);
        console.log('After Edit', tmp)
        // tmp.push(tmp[0]);

        let search_holepoly = holepoly.data.features.filter((x)=> booleanPointInPolygon(turfcentroid(turfpolygon([tmp])), turfpolygon(x.geometry.coordinates)))
        
        if (search_holepoly.length === 0) search_holepoly = coursepoly.data.features.filter((x)=> 
            booleanPointInPolygon(turfcentroid(turfpolygon([tmp])), turfpolygon(x.geometry.coordinates)) && x.properties.Course !=='전코스')

            if (search_holepoly.length === 0) search_holepoly = coursepoly.data.features.filter((x)=> 
            booleanPointInPolygon(turfcentroid(turfpolygon([tmp])), turfpolygon(x.geometry.coordinates)) && x.properties.Course ==='전코스')
        
        if (search_holepoly.length === 0) search_holepoly = [JSON.parse(JSON.stringify(INTERESTED_POLYGONBLANK))];

        polygon_info_ini = {...search_holepoly[0],
          geometry:{...search_holepoly[0].geometry, coordinates: [ds_mgrData2geojson(poly_.points)]},
          properties:{ ...search_holepoly[0].properties,Id:uuidv4(), Type: "Undefined", TypeId:0, 
            Valid: true, By: loginuser, When: (new Date()).toISOString(), Client: selected_course_info.name}
        }

        console.log(polygon_info_ini)

        new_polygons.push(polygon_info_ini)

        if (managerRef.current.getOverlays().polygon.length >0) {
        managerRef.current.remove(managerRef.current.getOverlays().polygon[0]);
        }

      })


      if(new_polygons.length>0){
        if (selected_polygon === null) {
          console.log("Multiple New Polygon Added")
          setCRSGeoJsonInfo(
            {...CRSgeojsoninfo, 
              features:[...CRSgeojsoninfo.features,...new_polygons].sort((a, b) =>  
              baseinfo.area_def.filter((x)=>x.name ===a['properties'].Type)[0].DSZindex - 
              baseinfo.area_def.filter((x)=>x.name ===b['properties'].Type)[0].DSZindex)
            }
          )
        }
        else {
          console.log("Update Existing Polygon")
          setCRSGeoJsonInfo(
            {...CRSgeojsoninfo, 
              features:[...CRSgeojsoninfo.features.filter((x) => x.properties.Id !== selected_polygon.properties.Id), {...selected_polygon, geometry:new_polygons[0].geometry}].sort((a, b) =>  
              baseinfo.area_def.filter((x)=>x.name ===a['properties'].Type)[0].DSZindex - 
              baseinfo.area_def.filter((x)=>x.name ===b['properties'].Type)[0].DSZindex)
            }
          )
        }
      }
      else {
        if (selected_polygon !== null) {
          console.log("Remove Existing Polygon")
          setCRSGeoJsonInfo(
            {...CRSgeojsoninfo, 
              features:[...CRSgeojsoninfo.features.filter((x) => x.properties.Id !== selected_polygon.properties.Id)].sort((a, b) =>  
              baseinfo.area_def.filter((x)=>x.name ===a['properties'].Type)[0].DSZindex - 
              baseinfo.area_def.filter((x)=>x.name ===b['properties'].Type)[0].DSZindex)
            }
          )
        }
      }


      setLocalMode('DSMAPGEOJSON_INI')

    }

  },[selected_mode, local_mode]);

  function cutPolygon() {
    let polys_in_mgr = managerRef.current.getData()
    
    console.log(polys_in_mgr, ds_mgrPolygon2TurfPolygon(polys_in_mgr.polygon[0]))
    console.log(ds_mgrPolyline2TurfPolyline(polys_in_mgr.polyline[0]))

    let out_ = polygonCut(ds_mgrPolygon2TurfPolygon(polys_in_mgr.polygon[0]),ds_mgrPolyline2TurfPolyline(polys_in_mgr.polyline[0]) )
    console.log(out_)

    managerRef.current.cancel()

    if (managerRef.current.getOverlays().polygon.length >0) {
      managerRef.current.remove(managerRef.current.getOverlays().polygon[0]);
      }

    if (managerRef.current.getOverlays().polyline.length >0) {
      managerRef.current.remove(managerRef.current.getOverlays().polyline[0]);
      }
    // managerRef.current.put(kakao.maps.drawing.OverlayType.POLYGON, ds_geojson2kakaoV2(out_['geometry']['coordinates'][0]))
    out_.forEach((x)=>
    managerRef.current.put(kakao.maps.drawing.OverlayType.POLYGON, ds_geojson2kakaoV2(x['geometry']['coordinates'][0])))

  }

  return(
    <>
      {isCRSLoading === false?
        <Fragment>
          <DrawingManager
            ref={managerRef}
            drawingMode={[
              kakao.maps.drawing.OverlayType.POLYLINE,
              kakao.maps.drawing.OverlayType.POLYGON,
            ]}
            guideTooltip={["draw", "drag", "edit"]}
            polygonOptions={{
              draggable: true,
              removable: true,
              editable: true,
              strokeColor: "#39f",
              strokeWeight:1,
              fillColor: "#39f",
              fillOpacity: 0.5,
              hintStrokeStyle: "solid",
              hintStrokeOpacity: 0.5,
            }}
            // DrawEND Event는 폴리건 신규 모드에서 만 불러짐.  따라서 Cutting Mode 인지 일반 신규 모드인지에 따라 달라짐
            onDrawend = {(data)=>{
              managerRef.current.cancel();
              // console.log("Darw End!!!!0", local_mode, data)
              if (local_mode === 'DSMAPGEOJSON_INI') setLocalMode('DSMAPGEOJSON_INI')
              else if (local_mode === 'DSMAPGEOJSON_CUT') setLocalMode('DSMAPGEOJSON_CUTLINE_END')
              

            }}
            >
              {/* {selected_mode === "MAPGEOJSONEDIT" && selected_polygon !== null? <Toolbox/>:null} */}
            </DrawingManager>

          {selected_mode === "MAPGEOJSONEDIT" && selected_polygon === null?
            <Fab color="primary" aria-label="add" size="small" variant="extended"
              sx ={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
              }}
              onClick={() => {setLocalMode('DSMAPGEOJSON_ADD')}}
              disabled = {local_mode=== 'DSMAPGEOJSON_ADD'}
            >
              <AddIcon />
              New Polygon
            </Fab>
            :null
          }
          {selected_mode === "MAPGEOJSONEDIT" && selected_polygon !== null?
            <Fab color="primary" aria-label="add" size="small" variant="extended"
              sx ={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
              }}
              onClick={() => {setLocalMode('DSMAPGEOJSON_CUT')}}
              disabled = {local_mode=== 'DSMAPGEOJSON_CUT'}
            >
              <AddIcon />
              ADD Cutting Line
            </Fab>
            :null
          }
          {/* {selected_mode === "MAPGEOJSONEDIT" && selected_polygon !== null?
            <Fab color="primary" aria-label="add" size="small" variant="extended"
              sx ={{
                  position: 'absolute',
                  top: 56,
                  left: 16,
              }}
              onClick={() => {setLocalMode('DSMAPGEOJSON_SIM')}}
              disabled = {local_mode=== 'DSMAPGEOJSON_SIM'}
            >
              <AddIcon />
              Simplyfy
            </Fab>
            :null
          } */}
          {selected_mode === "MAPGEOJSONEDIT" ?
            <Fab color="primary" aria-label="add" size="small" variant="extended"
              sx ={{
                  position: 'absolute',
                  bottom: 66,
                  left: 16,
              }}
              onClick={() => {redo()}}
              disabled = {selected_mode!== 'MAPGEOJSONEDIT'}
            >
              <AddIcon />
              REDO
            </Fab>
            :null
          }
          {selected_mode === "MAPGEOJSONEDIT" ?
            <Fab color="primary" aria-label="add" size="small" variant="extended"
              sx ={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
              }}
              onClick={() => {undo()}}
              disabled = {selected_mode!== 'MAPGEOJSONEDIT'}
            >
              <AddIcon />
              UNDO
            </Fab>
            :null
          }
        </Fragment>
        :null
      }
    </>
  )
}


export function ds_mgrPolygon2TurfPolygon(mgr_){
  var path_ = []
  for (const p of mgr_.points) {
    path_.push([p.x,p.y])
  }
  // path_.push(path_[0])
return turf.polygon([path_]);
};

export function ds_mgrPolyline2TurfPolyline(mgr_){
  var path_ = []
  for (const p of mgr_.points) {
    path_.push([p.x,p.y])
  }
  // path_.push(path_[0])
return turf.lineString(path_);
};

function polygonCut(polygon, line, idPrefix) {
  const THICK_LINE_UNITS = 'kilometers';
  const THICK_LINE_WIDTH = 0.001;
  var i, j, id, intersectPoints, lineCoords, forCut, forSelect;
  var thickLineString, thickLinePolygon, clipped, polyg, intersect;
  var polyCoords = [];
  var cutPolyGeoms = [];
  var cutFeatures = [];
  var offsetLine = [];
  var retVal = null;

  // if (((polygon.type != 'Polygon') && (polygon.type != 'MultiPolygon')) || (line.type != 'LineString')) {
  //   return retVal;
  // }

  if (typeof(idPrefix) === 'undefined') {
    idPrefix = '';
  }

  intersectPoints = turf.lineIntersect(polygon, line);

  console.log('Interesct',intersectPoints)
  if (intersectPoints.features.length == 0) {
    return retVal;
  }

  var lineCoords = turf.getCoords(line);
  console.log(turf.booleanWithin(turf.point(lineCoords[0]), polygon), 
    turf.booleanWithin(turf.point(lineCoords[lineCoords.length - 1]), polygon))

  if ((turf.booleanWithin(turf.point(lineCoords[0]), polygon) ||
      (turf.booleanWithin(turf.point(lineCoords[lineCoords.length - 1]), polygon)))) {
    return retVal;
  }

  // let polyCoords = []

  offsetLine[0] = turf.lineOffset(line, THICK_LINE_WIDTH, {units: THICK_LINE_UNITS});
  offsetLine[1] = turf.lineOffset(line, -THICK_LINE_WIDTH, {units: THICK_LINE_UNITS});

  offsetLine[0].geometry.coordinates.forEach((x)=> polyCoords.push(x))
  offsetLine[1].geometry.coordinates.slice().reverse().forEach((x)=> polyCoords.push(x))

  thickLineString = turf.lineString(polyCoords);
  thickLinePolygon = turf.lineToPolygon(thickLineString)
  clipped = turf.difference(polygon, thickLinePolygon);
  console.log("Clipped!!!", clipped)


  cutPolyGeoms = [];
  for (j = 0; j < clipped.geometry.coordinates.length; j++) {
    polyg = turf.polygon(clipped.geometry.coordinates[j]);
    intersect = turf.lineIntersect(polyg, offsetLine[0]);
    if (intersect.features.length > 0) {
      cutPolyGeoms.push(turf.polygon(polyg.geometry.coordinates));
    };

    intersect = turf.lineIntersect(polyg, offsetLine[1]);
    if (intersect.features.length > 0) {
      cutPolyGeoms.push(turf.polygon(polyg.geometry.coordinates));
    };
  };

  retVal = cutPolyGeoms
  // for (i = 0; i <= 1; i++) {
  //   forCut = i; 
  //   forSelect = (i + 1) % 2; 
  //   polyCoords = [];
  //   for (j = 0; j < line.coordinates.length; j++) {
  //     polyCoords.push(line.coordinates[j]);
  //   }
  //    for (j = (offsetLine[forCut].geometry.coordinates.length - 1); j >= 0; j--) {
  //     polyCoords.push(offsetLine[forCut].geometry.coordinates[j]);
  //   }
  //   polyCoords.push(line.coordinates[0]);

  //   thickLineString = turf.lineString(polyCoords);
  //   thickLinePolygon = turf.lineToPolygon(thickLineString);
  //   clipped = turf.difference(polygon, thickLinePolygon);

  //   cutPolyGeoms = [];
  //   for (j = 0; j < clipped.geometry.coordinates.length; j++) {
  //     polyg = turf.polygon(clipped.geometry.coordinates[j]);
  //     intersect = turf.lineIntersect(polyg, offsetLine[forSelect]);
  //     if (intersect.features.length > 0) {
  //       cutPolyGeoms.push(polyg.geometry.coordinates);
  //     };
  //   };

  //   cutPolyGeoms.forEach(function (geometry, index) {
  //     id = idPrefix + (i + 1) + '.' +  (index + 1);
  //     cutFeatures.push(turf.polygon(geometry, {id: id}));
  //   });
  // }

  // if (cutFeatures.length > 0) retVal = turf.featureCollection(cutFeatures);

  return retVal;
};