    // export const PRODURL =
    export const DEVURL =  'https://0p0bqhmxil.execute-api.us-east-1.amazonaws.com/dev';
    // export const NEWDEVURL = 'https://5hqqirfyi6.execute-api.us-east-1.amazonaws.com/devnew';
    export const BASEURL = DEVURL;

    export const DSYEAR = 2023;
    


    export const WORKBLANK= {
        metadata:'',
        mode:'',
        comment:'',
        date:'NA', 
        dscourseids: 'GC000', 
        desc: '미선택',
        editedby:'',
        end:'',
        start:'',
        resource:[], human:[], worktype:[], imagename:'',
        year:2023,
        month:0    
    };
    export const MAPINFO_INI =   {
      'center': [128.110 , 36.520],
      'level': 12,
      'bounds': {
        'sw': [],
        'ne': []
      }
    };

    export const COURSEBLANK =   {
      'id': '',
      'dscourseids': '',
      'name': '',
      'address': '',
      'map_info': MAPINFO_INI,
      'numHole':9,
      'course_names':''
    };


    export const POLYGONBLANK =   {
      "type": "Feature",
          "properties": {
            "Name": "Contour_",
            "Client": "",
            "Course": "",
            "Hole": "",
            "Type": "",
            "TypeId": 0,
            "DSZindex": 1,
            "Color": "#00a0e9",
            "Area": 0,
            "Centroid": []
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": []
          }
    };


    export const GEOJSONBLANK ={
      "type": "FeatureCollection",
      "crs": {
        "type": "name",
        "properties": {
          "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
        }
      },
      "features": [
        POLYGONBLANK,
      ]
    }
