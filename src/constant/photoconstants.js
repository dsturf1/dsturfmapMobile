

const label_single = {
    level1:"",
    level2:"",
    level3:"",
    TurfType:""
  }

  export const photo_single = {
    id: "",
    name:"",
    imgsrc:"",
    thumbsrc:"",
    ndvisrc:"",
    gps:{},
    date:"",
    info:{
      type:"",// TBD, 잔디 현황, 작업 사진, 방제 일보, 계측기 결과, NDVI, Thermal
      typeId:0,
      label: label_single,
      desc:"",
      value:0.0,
      ndvi_avg:0.0,
      temp_avg:0.0
    },
    by:""
  }

