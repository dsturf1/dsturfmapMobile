import React, { useRef, useEffect, useState, useContext , Fragment} from 'react';
import { Box, Button, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress} from '@mui/material';
import { Annotorious } from '@recogito/annotorious';


import '@recogito/annotorious/dist/annotorious.min.css';
import "./anno.css";

export default function DSIMGAnnotorious({image}) {

  // Ref to the image DOM element
  const imgEl = useRef();

  // The current Annotorious instance
  const [ anno, setAnno ] = useState();

  // Current drawing tool name
  const [ tool, setTool ] = useState('rect');

  // Init Annotorious when the component
  // mounts, and keep the current 'anno'
  // instance in the application state
  useEffect(() => {
    let annotorious = null;

    if (imgEl.current) {
      // Init
      annotorious = new Annotorious({
        image: imgEl.current
      });

      // Attach event handlers here
      annotorious.on('createAnnotation', annotation => {
        console.log('created', annotation);
      });

      annotorious.on('updateAnnotation', (annotation, previous) => {
        console.log('updated', annotation, previous);
      });

      annotorious.on('deleteAnnotation', annotation => {
        console.log('deleted', annotation);
      });
    }

    // Keep current Annotorious instance in state
    setAnno(annotorious);

    // Cleanup: destroy current instance
    return () => annotorious.destroy();
  }, []);

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

