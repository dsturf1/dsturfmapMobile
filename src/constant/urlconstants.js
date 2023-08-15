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
        "Id":"",
        "Client": "",
        "Course": "",
        "Hole": "",
        "Type": "Undefined",
        "TypeId": 0,
        "Desc":"",
        "Valid":true,
        "By":"",
        "When":""
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": []
      }
    };

    export const INTERESTED_POLYGONBLANK =   {
      "type": "Feature",
      "properties": {
        "Name": "Contour_",
        "Id":"",
        "Client": "",
        "Course": "",
        "Hole": "",
        "Type": "관심영역",
        "TypeId": 10,
        "Desc":"",
        "Valid":true,
        "By":"",
        "When":""
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
      "features": []
    }
