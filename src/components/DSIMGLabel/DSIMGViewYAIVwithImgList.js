import React, { useRef, useEffect, useState, useContext , Fragment} from 'react';
import { Box, Button, Stack, Avatar, ButtonGroup, Typography, Grid, InputLabel, MenuItem, FormControl, Select, Divider, CircularProgress} from '@mui/material';
import { BaseContext, MapQContext, MapCRSQContext, LabelContext} from "../../context"

import Inline from "yet-another-react-lightbox/plugins/inline";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";


import InfoIcon from '@mui/icons-material/Info';
import { ImageList, ImageListItem, ImageListItemBar, ListSubheader, IconButton} from '@mui/material';
import { label_Level1_info,  label_Level2_info, turf_type , label_single} from '../../constant/labelconstants';
 
export default function DSIMGView() {


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, 
    setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, se5Gon} = useContext(BaseContext);

  const {labeljson, setLabelJson, selected_labeljson, setSLabelJson, imgURLs, setImgURLs, selected_singlelabel, setSSLabel, selected_capdate, setCapDate} = useContext(LabelContext);

  const [caption, setCaption] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [selected_Lmode, setLabelMode] = useState("GRPLABEL")

 
  useEffect(() => {

    console.log("SLides",  imgURLs)

    return () => {}
  }, []);


  useEffect(() => {
    if (index <0) return
    if(Object.keys(selected_labeljson).length === 0) return

    let newJson = {...selected_labeljson.filter((x) => x.id === imgURLs[index].id)[0]}

    if(newJson.label.length ===0) newJson = {...newJson, label:[label_single]}
    
    setSSLabel({...newJson})

    console.log("INDEX Changed", index)
    imgURLs.length>0 && index>=0? setCaption('['+index+'/'+ imgURLs.length+']'+imgURLs[index].desc):setCaption("")

    return () => {}
  }, [index]);


 
  return (
    <>
        <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={0}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
          <Button variant= {selected_mode === "GRPLABEL"? "outlined":"contained"}  sx={{ width: 1/4}} onClick={() => {
            if(selected_mode === "GRPLABEL") {
              setMode("INDLABEL")
            }
            else {
              setMode("GRPLABEL");
              // setIndex(0)
            }

          }}> 
            {selected_mode === "GRPLABEL"? "개별이미지보기":"그룹이미지보기"}       
          </Button>
          <Button sx={{ width: 3/4}}>{caption}</Button>
        </ButtonGroup>

        {selected_mode === "GRPLABEL" && Object.keys(selected_labeljson).length !== 0? 
            <ImageList sx={{ width: '100%', height: '100%' }} cols={6}>
            {imgURLs.map((item, i_) => (
              <ImageListItem key={'ds'+item.id}>
                <div style={index === i_? {width: 360, height: 280 ,border: '5px solid blue'}:{width: 360, height: 280}}>
                <img
                  style={{ width: '100%', height:'100%' }}
                  src={item.thumb}
                  alt={item.desc}
                  loading="lazy"
                  onClick={()=>{setIndex(i_)}}
                />
                </div>
                <ImageListItemBar
                  title={'['+ i_ +']'+item.desc}
                  subtitle={selected_labeljson.filter((item_)=> item_.id === item.id).length === 0? "라밸미지정":selected_labeljson.filter((item_)=> item_.id === item.id)[0].label.map((x)=> '['+ x.level1 +']')}
                  actionIcon={
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                      aria-label={`info about ${item.desc}`}
                    >
                    </IconButton>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
          :
          <Lightbox
            index={index}
            open={selected_mode === "INDLABEL"}
            plugins={[Inline, Zoom,Thumbnails]}
            inline={{ style: { width: "100%", height:"100%" } }}
            slides={imgURLs}
            on={{
              view: ({ index }) => {
                // imgURLs.length>0 && index>=0? setCaption('['+index+'/'+ imgURLs.length+']'+imgURLs[index].desc):setCaption("");
                setIndex(index)
              }
              // view?: ({ index }: { index: number }) 
            }}
          />
        }
    </>
);
}