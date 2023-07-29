import React, { createContext, useState, useEffect} from 'react';


export const SInfoContext = createContext();

export const SInfoProvider = (props) => {

    const { kakao } = window;

    const [searchinfo, setSearchInfo] = useState([]);
    const [selected_info, setSelectedInfo] = useState(null);
    const [search_word, setSearchWord] = useState('골프장');
    const [addedToDB, setAddedToDB] =useState(false)

    useEffect(() => {

      const ps = new kakao.maps.services.Places()
  
      if (search_word !== '골프장') ps.keywordSearch(search_word, (data, status, _pagination) => {
        if (status === kakao.maps.services.Status.OK) {
          console.log(data);
          setSearchInfo(data);
        }
      })
  
    },[search_word]);

    // useEffect(() => {
    //       console.log(selected_info);
  
    // },[selected_info]);


    return(

    <SInfoContext.Provider  value={{searchinfo, setSearchInfo,selected_info, setSelectedInfo, search_word, setSearchWord, addedToDB, setAddedToDB}}>
        {props.children}
    </SInfoContext.Provider >
    
    );
}