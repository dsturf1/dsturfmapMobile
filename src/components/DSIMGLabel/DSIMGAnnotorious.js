import React, { useRef, useEffect, useState, useContext , Fragment} from 'react';
import { Box, Button, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress} from '@mui/material';
import { Annotorious } from '@recogito/annotorious';
import { BaseContext, MapQContext, MapCRSQContext, LabelContext} from "../../context"
import {BASEURL} from "../../constant/urlconstants.js";
import { Amplify, Auth , Storage } from 'aws-amplify';

import '@recogito/annotorious/dist/annotorious.min.css';
import "./anno.css";

export default function DSIMGAnnotorious({image}) {

  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, 
    setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, se5Gon} = useContext(BaseContext);

  const {labeljson, setLabelJson, selected_labeljson, setSLabelJson, imgURLs, setImgURLs, selected_singlelabel, setSSLabel, selected_capdate, setCapDate} = useContext(LabelContext);

  // Ref to the image DOM element
  const imgEl = useRef();

  // The current Annotorious instance
  const [ anno, setAnno ] = useState(null);

  // Current drawing tool name
  const [ tool, setTool ] = useState('rect');

  const PostLabelSingle = async function (labelJson_) 
  {

    const url_ = BASEURL + '/label/'+selected_course +'?'
    const myInit = {
      method: 'POST',
      body: JSON.stringify( labelJson_),
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    try {
        const fetchData = await fetch(url_, myInit).then((response) => response.json())
        console.log('At Post', fetchData)
        return fetchData
        } catch (err) { 
          console.log('LabelInfo Saving Error', err, url_); 
          alert('저장에 실했읍니다.')
          return err; 
      
      }
 
  }

  // Init Annotorious when the component
  // mounts, and keep the current 'anno'
  // instance in the application state
  useEffect(() => {
    let annotorious = null;
    // if (Object.keys(selected_singlelabel).length===0) return
    

    if (imgEl.current) {
      // Init
      // let tagLabels = selected_singlelabel.label.map((x)=> x.level1 + '_' + x.level2)

      annotorious = new Annotorious({
        image: imgEl.current,
        widgets: [
          'COMMENT',
          { widget: 'TAG', vocabulary: ['James','Tom'] }
        ]

      });

      // annotorious.widgets = [...annotorious.widgets, { widget: 'TAG', force: 'React', vocabulary: [ 'Animal', 'Building', 'Waterbody'] } ];

      // Attach event handlers here
      annotorious.on('createAnnotation', annotation => {
        console.log('created', annotation, selected_singlelabel);    
        let updatedJson = {...selected_singlelabel, annotation:[...selected_singlelabel.annotation,{...annotation}]}
        setSSLabel({...updatedJson})
        setLabelJson([...labeljson.filter((x)=>x.id !== selected_singlelabel.id ), {...updatedJson}])
        let saveJson = {
            id: updatedJson.id,
            metadata:selected_course+updatedJson.info.date+updatedJson.info.area+updatedJson.info.desc,
            date :updatedJson.info.date,
            area:updatedJson.info.area,
            desc:updatedJson.info.desc,
            json:{...updatedJson}
        }
        PostLabelSingle({...saveJson})
      });

      annotorious.on('updateAnnotation', (annotation, previous) => {
        console.log('updated', annotation, previous);
        let updatedJson = {...selected_singlelabel, annotation:[...selected_singlelabel.annotation.filter((x)=>x.id !== annotation.id),{...annotation}]}
        setSSLabel({...updatedJson})
        setLabelJson([...labeljson.filter((x)=>x.id !== selected_singlelabel.id ), {...updatedJson}])
        let saveJson = {
            id: updatedJson.id,
            metadata:selected_course+updatedJson.info.date+updatedJson.info.area+updatedJson.info.desc,
            date :updatedJson.info.date,
            area:updatedJson.info.area,
            desc:updatedJson.info.desc,
            json:{...updatedJson}
        }
        PostLabelSingle({...saveJson})
      });

      annotorious.on('deleteAnnotation', annotation => {
        console.log('deleted', annotation);
        let updatedJson = {...selected_singlelabel,annotation:[...selected_singlelabel.annotation.filter((x)=>x.id !== annotation.id)]}
        setSSLabel({...updatedJson})
        setLabelJson([...labeljson.filter((x)=>x.id !== selected_singlelabel.id ), {...updatedJson}])
        let saveJson = {
            id: updatedJson.id,
            metadata:selected_course+updatedJson.info.date+updatedJson.info.area+updatedJson.info.desc,
            date :updatedJson.info.date,
            area:updatedJson.info.area,
            desc:updatedJson.info.desc,
            json:{...updatedJson}
        }
        PostLabelSingle({...saveJson})
      });
    }

    // Keep current Annotorious instance in state
    console.log(annotorious)
    setAnno(annotorious);

    // Cleanup: destroy current instance
    return () => annotorious.destroy();
  }, []);

  useEffect(() => {



  }, [image]);



  // Toggles current tool + button label
  const toggleTool = () => {
    if (tool === 'rect') {
      setTool('polygon');
      anno.setDrawingTool('polygon');
    } else {
      setTool('rect');
      anno.setDrawingTool('rect');
    }
  }

  return (
    <div>
      <div>
        <button
          onClick={toggleTool}>
            { tool === 'rect' ? 'RECTANGLE' : 'POLYGON' }
        </button>

        <button
          onClick={()=>{
            if (anno === null) return
            if (Object.keys(selected_singlelabel).length===0) return
        
        
        
            selected_singlelabel.annotation.forEach(element => {
              anno.addAnnotation(element)
              
            });

          }}>
            Load Annotation
        </button>
        <button
          onClick={()=>{
            if (anno === null) return
            if (Object.keys(selected_singlelabel).length===0) return
          }}>
            Save Annotation
        </button>
      </div>
      {image ==null? 
      <div
        width='800px' 
        height='600px'    
        >
        <img 
        ref={imgEl} 
        src="logo512.png"
        alt="Hallstatt Town Square" />
      </div>
      
      :
      // <Stack direction="row" spacing={2}   justifyContent="center"  alignItems="flex-start" mt = {2}>
      <div className="profile_picture">
        <img 
          ref={imgEl} 
          src={image.rgb}      
          width='800px' 
          height='600px'   
          // style={"border-image-width: 30px"}
          alt="Hallstatt Town Square" />
        <img 
          src={image.ndvi}      
          width='800px' 
          height='600px'   
          alt="Hallstatt Town Square" />
      {/* // </Stack> */}
      </div>
      }
    </div>
  );
}

