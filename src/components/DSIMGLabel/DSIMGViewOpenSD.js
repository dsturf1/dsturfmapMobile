import React, { useRef, useEffect, useState, useContext , Fragment} from 'react';
import { Box, Button, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress} from '@mui/material';
import OpenSeaDragon from "openseadragon";
import "./ocd.css";
 
export default function DSIMGView({image}) {

  const viewerRef = useRef(null);


  useEffect(() => {

    if(viewerRef.current === null) return

    if(image != null){
      console.log(image)
      viewerRef.current.open({
        type: 'image',
        url:  image.src,        
        buildPyramid: false
    });
    }


  }, [image]);



  useEffect(() => {
    const viewer =  OpenSeaDragon({
      id: "openSeaDragon",
      // prefixUrl: "openseadragon-images/",
      animationTime: 0.5,
      blendTime: 0.1,
      constrainDuringPan: true,
      maxZoomPixelRatio: 2,
      minZoomLevel: 1,
      visibilityRatio: 1,
      zoomPerScroll: 2,
      zoomInButton: 'zoom-in',
      zoomOutButton: 'zoom-out',
      homeButton: 'reset',
      fullPageButton: 'full-page',
      nextButton: 'next',
      previousButton: 'previous',
      showNavigator:  true,
    })
    viewerRef.current = viewer;
    return () => {
      viewerRef.current.destroy();
    };
  }, []);
 
 
  return (
    <>
        {/* <Button >{image && viewer && image.title}</Button> */}
        <div className="ocd-div">
          <div className="openseadragon" id="openSeaDragon" 
                    // style={{
                    //   height: "800px",
                    //   width: "1200px"
                    // }}
                    ref = {viewerRef} ></div>
          <ul className="ocd-toolbar">
              <li><a id="zoom-in"><i className="fa fa-plus"></i></a></li>
              <li><a id="reset"><i className="fa fa-circle"></i></a></li>
              <li><a id="zoom-out"><i className="fa fa-minus"></i></a></li>
              <li><a id="full-page"><i className="fa fa-cog"></i></a></li>
          </ul>
        </div>

    </>
);
}