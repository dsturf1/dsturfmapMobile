import React, { createContext, useState, useEffect} from 'react';
import { BASEURL } from '../constant/urlconstants';



export const BaseContext = createContext();

export const BaseProvider = (props) => {

    const [baseinfo, setBaseInfo] = useState({});
    const [selected_course, setCourse] = useState('GC000');
    const [edited, setEdited] = useState(false);
    const [loginuser, setLoginUser] = useState("");
    const [selected_mode, setMode] = useState('Plan');
    const [maxid, setMaxId] = useState();
    
  
    const url = BASEURL + '/baseinfo?'+  new URLSearchParams({user: props.user.username });

    useEffect(() => {
        // 처음 데이터를 읽어서 성공하면 State를 Update

        const fetchBaseInfo = async() => {
            try {
                const fetchData = await fetch(url).then((response) => response.json())
                setBaseInfo({'user':props.user,...fetchData.body})
                setCourse('MGC000')
                } catch (err) { console.log('Baseinfo Fetching Error', err) }
        }

        fetchBaseInfo();
        


      },[]);

    // useEffect(() => {
    //     console.log('Selection Changed !:', selected_course, selected_date, selected_org, selected_year, selected_mode, selected_month);
    //   },[selected_course, selected_date, selected_org, selected_year, selected_mode, selected_month]);

    useEffect(() => {

      console.log('BaseInfo:', baseinfo, Object.keys(baseinfo).length === 0);

      if (typeof baseinfo.course_info === 'undefined') return
      
      console.log(Math.max(...baseinfo.course_info.map(x => x.id.slice(3,6))))
      setMaxId(Math.max(...baseinfo.course_info.map(x => x.id.slice(3,6))))

    },[baseinfo]);


    return(

    <BaseContext.Provider  value={{baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, setMode, maxid, setMaxId}}>
        {props.children}
    </BaseContext.Provider >
    
    );
}