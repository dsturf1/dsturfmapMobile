import React, { useRef, useEffect, useState, useContext , Fragment} from 'react';
import { Box, Button, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress} from '@mui/material';
import Inline from "yet-another-react-lightbox/plugins/inline";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
 
export default function DSIMGView({DSslides}) {

  const [open, setOpen] = React.useState(true);
  const [caption, setCaption] = React.useState("");




 
  useEffect(() => {



    return () => {}
  }, []);


 
  return (
    <>
        <Button >{caption}</Button>

        <Lightbox
            open={open}
            close={() => setOpen(false)}
            plugins={[Inline, Zoom]}
            inline={{ style: { width: "100%", height:"100%" } }}
            slides={DSslides}
            on={{
              click: ({ index }) => {DSslides.length>0? setCaption(DSslides[index].description):setCaption(""); console.log(index, DSslides[index])

              }
            }}
        />
    </>
);
}