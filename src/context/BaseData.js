import React, { createContext, useState, useEffect} from 'react';
import { BASEURL,  MAPBLANK, MAPINFO_INI, COURSEBLANK,POLYGONBLANK } from '../constant/urlconstants';


const mapinfo_ini = JSON.parse(JSON.stringify(MAPINFO_INI));
const course_info_ini = JSON.parse(JSON.stringify(COURSEBLANK));
const polygon_info_ini = JSON.parse(JSON.stringify(POLYGONBLANK));

export const BaseContext = createContext();

export const BaseProvider = (props) => {

    const [baseinfo, setBaseInfo] = useState({});
    const [selected_course, setCourse] = useState('MGC000');
    const [edited, setEdited] = useState(false);
    const [loginuser, setLoginUser] = useState("");
    const [selected_mode, setMode] = useState('Search');
    const [maxid, setMaxId] = useState();
    const [mapinfo, setMapInfo] = useState(mapinfo_ini);
    const [selected_course_info, setSelectedCourseInfo] = useState(null);
    const [selected_polygon, setPolyGon] = useState(null);
    
  
    const url = BASEURL + '/baseinfo?'+  new URLSearchParams({user: props.user.username });

    useEffect(() => {
        // 처음 데이터를 읽어서 성공하면 State를 Update

        const fetchBaseInfo = async() => {
            try {
                const fetchData = await fetch(url).then((response) => response.json())
                setBaseInfo({'user':props.user,...fetchData.body})
                setCourse('MGC000')
                setMapInfo({...mapinfo_ini})
                } catch (err) { console.log('Baseinfo Fetching Error', err) }
        }

        fetchBaseInfo();
        console.log(mapinfo)
        


      },[]);

    useEffect(() => {

      if (selected_course === "MGC000") {
        setSelectedCourseInfo(null);
        setMapInfo(mapinfo_ini)
        return

      }
      if (Object.keys(baseinfo).length === 0) return

      let crs_info_ = baseinfo.course_info.filter((x)=> x.id === selected_course)[0]
  
      console.log("Selected Course Info : ", crs_info_)
      setSelectedCourseInfo({...crs_info_})
      setMapInfo({...crs_info_.map_info})
  
    }, [selected_course])

    useEffect(() => {

      // console.log('BaseInfo:', baseinfo, Object.keys(baseinfo).length === 0);

      if (typeof baseinfo.course_info === 'undefined') return
      
      // console.log(Math.max(...baseinfo.course_info.map(x => x.id.slice(3,6))))
      setMaxId(Math.max(...baseinfo.course_info.map(x => x.id.slice(3,6))))

    },[baseinfo]);




    return(

    <BaseContext.Provider  value={{baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser,
      selected_mode, setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, setPolyGon}}>
        {props.children}
    </BaseContext.Provider >
    
    );
}