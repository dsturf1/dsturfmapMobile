import React, { useRef, useEffect, useState, useContext , Fragment} from 'react';
import { Box, Button, Stack, Avatar, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, IconButton, CircularProgress} from '@mui/material';
import ReactImageAnnotate from "react-image-annotate";

 
export default function DSIMGAnnotate({DSslides}) {

  const [open, setOpen] = React.useState(true);
  const [caption, setCaption] = React.useState("");




 
  useEffect(() => {



    return () => {}
  }, []);


 
  return (
    <>
        <Button >{caption}</Button>

        <ReactImageAnnotate
          labelImages
          regionClsList={["Alpha", "Beta", "Charlie", "Delta"]}
          regionTagList={["tag1", "tag2", "tag3"]}
          images={[
            {
              src: "https://placekitten.com/408/287",
              name: "Image 1",
              regions: []
            }
          ]}
        />
    </>
);
}