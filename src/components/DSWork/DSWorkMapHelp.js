
import { Box, Button, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress} from '@mui/material';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { BaseContext, MapQContext, MapCRSQContext} from "../../context/index.js"
import {createGeoJSONCircle} from "../DSBasics/DSCordUtils.js";
import { point as turfpoint, polygon as turfpolygon, booleanPointInPolygon, bbox as turfbbox ,centroid as turfcentroid} from "@turf/turf";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import * as turf from "@turf/turf";
import {label_single} from '../../constant/labelconstants.js';
import './Map.css';
import { BASEURL,  MAPBLANK, MAPINFO_INI, COURSEBLANK,POLYGONBLANK,  GEOJSONBLANK, MAPBOXINI, INTERESTED_POLYGONBLANK, INTERESTED_POINT } from '../../constant/urlconstants';
import { ContactPageSharp } from '@mui/icons-material';




const polgygon_ini = JSON.parse(JSON.stringify(INTERESTED_POLYGONBLANK));
const point_ini = JSON.parse(JSON.stringify(INTERESTED_POINT));
const mapboxini_poly = JSON.parse(JSON.stringify(MAPBOXINI));
const geojsoninfo_blank = JSON.parse(JSON.stringify(GEOJSONBLANK));
 
export const initMAP  = (map) => {

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
  }
export const check_CRSandHole = (pnt_, holepoly, coursepoly) =>
  {
    let search_holepoly = holepoly.data.features.filter((x)=> booleanPointInPolygon(pnt_, turfpolygon(x.geometry.coordinates)))

    if (search_holepoly.length === 0) search_holepoly = coursepoly.data.features.filter((x)=> 
        booleanPointInPolygon(pnt_, turfpolygon(x.geometry.coordinates)) && x.properties.Course !=='전코스')

    if (search_holepoly.length === 0) search_holepoly = coursepoly.data.features.filter((x)=> 
        booleanPointInPolygon(pnt_, turfpolygon(x.geometry.coordinates)) && x.properties.Course ==='전코스')
    
    if (search_holepoly.length === 0) search_holepoly = [JSON.parse(JSON.stringify(INTERESTED_POLYGONBLANK))];

    return search_holepoly
  }