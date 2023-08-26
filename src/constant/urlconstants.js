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
        "When":"",
        "Labels":[],
        "LabelL1":"",
        "LabelL2":"",
        "TurfType":"",
        "Start": "",
        "End": ""
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": []
      }
    };

    export const INTERESTED_POINT =   {
      "type": "Feature",
      "properties": {
        "Name": "Contour_",
        "Id":"",
        "Client": "",
        "Course": "",
        "Hole": "",
        "Type": "관심포인트",
        "TypeId": 11,
        "Desc":"",
        "Valid":true,
        "By":"",
        "When":"",
        "Labels":[],
        "LabelL1":"",
        "LabelL2":"",
        "TurfType":"",
        "Start": "",
        "End": ""
      },
      "geometry": {
        "type": "Point",
        "coordinates": [],
        "radius":1.0
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
        "When":"",
        "Labels":[],
        "LabelL1":"",
        "LabelL2":"",
        "TurfType":"",
        "Start": "",
        "End": ""
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



    export const MAPBOXINI ={
      'type': 'geojson',
      'data': {

        "type": "Feature",
        "properties": {
          "Name": "Contour_",
          "Id": "ff1ee33a-537a-4908-9c96-2d18f5d627b0",
          "Client": "포항cc",
          "Course": "",
          "Hole": "",
          "Type": "관심영역",
          "TypeId": 10,
          "Desc": "",
          "Valid": true,
          "By": "dsadmin",
          "When": "2023-08-16T06:31:56.671Z",
          "Labels":[],
          "LabelL1":"",
          "LabelL2":"",
          "TurfType":"",
          "Start": "",
          "End": ""
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                124.45748712369486,
                37.86985595462009
              ],
              [
                124.60590412875992,
                34.21022244212531
              ],
              [
                130.08201135246642,
                34.181016991658616
              ],
              [
                130.15887441834013,
                37.85492119526653
              ],
              [
                124.45748712369486,
                37.86985595462009
              ]
            ]
          ]
        }
      }
    }

  export const label_Level1_info = ['건강한잔디','물리적피해','병해','충해','잡초']

  export const label_Level2_info = [
    ['일반',	'배토',	'통기(유공)',	'통기(무공)'	,'시비(알비)',	'시비(액비)'	,'깎기'	,'보식'	,'농약살포'	,'제초제 (발아전)'	,'제초제 (경엽)'	,'버티칼모잉'	,'브러쉬작업',	'스위퍼작업',	'구르밍작업',	'기타'],
    ['볼마크',	'건조피해',	'플레이어 답압'	,'고온피해',	'디봇',	'과습피해',	'약해',	'음지피해'	,'장비피해',	'저온피해',	'기타피해'],
    ['엽고성병'	,'패취류',	'토양병',	'조류',	'기타'],
    ['나방류'	,'굼벵이류'	,'응애',	'기타'],
    ['화본과',	'사초과',	'광엽',	'이종잔디'	,'이끼'	,'기타']

  ]
  export const turf_type = ['한국잔디','벤트그래스',	'켄터키블루그래스',	'라이그래스',		'버뮤다그래스']


  export const label_single = {
    level1:"",
    level2:"",
    level3:"",
    TurfType:""
  }

