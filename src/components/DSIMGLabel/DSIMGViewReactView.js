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
import Viewer from 'react-viewer';

import DSIMGAnnotorious from './DSIMGAnnotorious';


import InfoIcon from '@mui/icons-material/Info';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { ImageList, ImageListItem, ImageListItemBar, ListSubheader, IconButton} from '@mui/material';
import { label_Level1_info,  label_Level2_info, turf_type , label_single} from '../../constant/labelconstants';
 
export default function DSIMGView() {


  const {baseinfo, setBaseInfo, selected_course, setCourse, edited, setEdited, loginuser, setLoginUser, selected_mode, 
    setMode, maxid, setMaxId, mapinfo, setMapInfo, selected_course_info, setSelectedCourseInfo, selected_polygon, se5Gon} = useContext(BaseContext);

  const {labeljson, setLabelJson, selected_labeljson, setSLabelJson, imgURLs, setImgURLs, selected_singlelabel, setSSLabel, selected_capdate, setCapDate} = useContext(LabelContext);

  const [caption, setCaption] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [multiIndex, setMultiIndex] = useState([]);
  const [ndviView, setNDVIView] = useState(false)

  const [ visible, setVisible ] = React.useState(false);

 
  useEffect(() => {

    console.log("SLides",  imgURLs)

    return () => {}
  }, []);


  useEffect(() => {

    if (index <0) return
    if(Object.keys(labeljson).length === 0) return

    let newJson = {...labeljson.filter((x) => x.id === imgURLs[index].id)[0]}

    if(newJson.label.length ===0) newJson = {...newJson, label:[label_single]}
    
    setSSLabel({...newJson})

    // console.log("INDEX Changed", index, newJson)
    imgURLs.length>0 && index>=0? setCaption('['+index+'/'+ imgURLs.length+']'+imgURLs[index].desc):setCaption("")


    if (multiIndex.length>1){
        let grpJson = []
        multiIndex.forEach((i_)=>{
            let newJson = {...labeljson.filter((x) => x.id === imgURLs[i_].id)[0]}
            setSLabelJson([...selected_labeljson, {...newJson}])
        }
        )
    }
    else setSLabelJson([])

    return () => {}
  }, [index]);

  useEffect(() => {

    if (index <0) return
    if(Object.keys(labeljson).length === 0) return
    let grpJson = []

    if (multiIndex.length>1){

        multiIndex.forEach((i_)=>{
            let newJson = {...labeljson.filter((x) => x.id === imgURLs[i_].id)[0]}
            grpJson = [...grpJson, {...newJson}]
        }
        )
    }
    setSLabelJson(grpJson)

    return () => {}
  }, [multiIndex]);


 
  return (
    <>
        <ButtonGroup variant="outlined" aria-label="outlined button group" fullWidth spacing={0}   justifyContent="center"  alignItems="center" sx={{ mt: 1 }}>
          <Button variant= {selected_mode === "GRPLABEL"? "outlined":"contained"}  sx={{ width: 1/5}} onClick={() => {
            if(selected_mode === "GRPLABEL") {
              setMode("INDLABEL")
            }
            else {
              setMode("GRPLABEL");
            }

          }}> 
            {selected_mode === "GRPLABEL"? "개별이미지보기":"그룹이미지보기"}       
          </Button>
          <Button variant= 'outlined' sx={{ width: 1/5}} onClick={() => setNDVIView(!ndviView)}> 
                NDVI & Annotate
          </Button>
          <Button sx={{ width: 3/5}}>{caption}</Button>
        </ButtonGroup>

        {selected_mode === "GRPLABEL" && Object.keys(labeljson).length !== 0? 
          (ndviView === false?
            <>
            <ImageList sx={{ width: '100%', height: '100%' }} cols={7}>
              {imgURLs.map((item, i_) => (
                <ImageListItem key={'ds'+item.id}>
                  <div  style={multiIndex.includes(i_)? {width: 216, height: 162 ,border: '5px solid blue'}:{width: 216, height: 162}}>
                  <img
                    style={{ width: '100%', height:'100%' }}
                    src={item.thumb}
                    alt={item.desc}
                    loading="lazy"
                    onClick={(e)=>{
                      let mI_ = []

                      if (e.shiftKey) {
                          index > i_? mI_ = Array.from({ length: (index - i_ + 1 )},(value , index_) => i_ + index_):
                          mI_ = Array.from({ length: (i_ - index+ 1 )},(value , index_) => index + index_)
                          console.log(mI_)
                          setMultiIndex(mI_)
                          return
                        }

                      if (e.ctrlKey) {
                          setMultiIndex([...multiIndex, i_])
                          return
                      }
                      setIndex(i_);
                      setMultiIndex([i_])
                    }}
                  />
                  </div>
                  <ImageListItemBar
                    sx={{
                      "& .MuiImageListItemBar-title": { fontSize:'10pt'}, //styles for title
                      "& .MuiImageListItemBar-subtitle": { color: "yellow" ,fontSize:'8pt'}, //styles for subtitle
                      width: '100%'
                    }}
                    title={'['+ i_ +']'+item.desc}
                    // position="below"
                    subtitle={labeljson.filter((item_)=> item_.id === item.id).length === 0? 
                      "라밸미지정":labeljson.filter((item_)=> item_.id === item.id)[0].label.map((x)=> '['+ x.level1 +']')}
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(256, 256, 0, 0.54)' }}
                        aria-label={`info about ${item.desc}`}
                        onClick={() => {
                          if (index ===0) return;                      
                          // setIndex(i_);
                          // setMultiIndex([i_]);
                          setVisible(true);
                        }}
                      >
                      <ZoomInIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
            <Viewer
            visible={visible}
            onClose={() => { setVisible(false); } }
            images={multiIndex.map((x) => imgURLs[x])}
            />
            </>
            
            
            
            :<DSIMGAnnotorious image = {imgURLs[index]}/>)
          :
          (ndviView === false?
          <Stack direction="row" spacing={2}>
            <Box component="div" height="80vh" width = "460px" sx={{ p: 0, border: '1px solid gray',gap: 0, 
                borderRadius: 0 , m: 0, flexDirection: 'column', display: 'flex', alignContent: 'flex-start'}}> 
            <ImageList sx={{ width: '100%', height: '100%' }} cols={2}>
              {imgURLs.map((item, i_) => (
                <ImageListItem key={'ds'+item.id}>
                  <div  style={multiIndex.includes(i_)? {width: 216, height: 162 ,border: '5px solid blue'}:{width: 216, height: 162}}  >
                  <input
                    style={{ width: '100%', height:'100%' }}
                    type="image"
                    autoFocus={i_ === index? true:false}
                    src={item.thumb}
                    alt={item.desc}
                    loading="lazy"
                    onClick={(e)=>{
                      let mI_ = []

                      if (e.shiftKey) {
                          index > i_? mI_ = Array.from({ length: (index - i_ + 1 )},(value , index_) => i_ + index_):
                          mI_ = Array.from({ length: (i_ - index+ 1 )},(value , index_) => index + index_)
                          console.log(mI_)
                          setMultiIndex(mI_)
                          return
                        }

                      if (e.ctrlKey) {
                          setMultiIndex([...multiIndex, i_])
                          return
                      }
                      setIndex(i_);
                      setMultiIndex([i_])
                    }}
                  />
                  </div>
                  <ImageListItemBar
                    sx={{
                      "& .MuiImageListItemBar-title": { fontSize:'10pt'}, //styles for title
                      "& .MuiImageListItemBar-subtitle": { color: "yellow" ,fontSize:'8pt'}, //styles for subtitle
                      width: '100%'
                    }}
                    title={'['+ i_ +']'+item.desc}
                    // position="below"
                    subtitle={labeljson.filter((item_)=> item_.id === item.id).length === 0?  "라밸미지정":labeljson.filter((item_)=> item_.id === item.id)[0].label.map((x)=> '['+ x.level1 +']')}
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(256, 256, 0, 0.54)' }}
                        aria-label={`info about ${item.desc}`}
                      >
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
            </Box>
            {/* <Box  component="div" height="80vh"  width = "100%" sx={{ p: 0, border: '1px solid gray',gap: 0, 
                borderRadius: 0 , m: 0, flexDirection: 'column', display: 'flex', alignContent: 'flex-start', overflow:'auto'}}>  */}
            <Lightbox
              index={index}
              open={selected_mode === "INDLABEL"}
              plugins={[Inline, Zoom]}
              inline={{ style: { width: "100%", height:"100%" } }}
              slides={imgURLs}
              on={{
                view: ({ index }) => {
                  // imgURLs.length>0 && index>=0? setCaption('['+index+'/'+ imgURLs.length+']'+imgURLs[index].desc):setCaption("");
                  setIndex(index)
                  setMultiIndex([index]);
                }
                // view?: ({ index }: { index: number }) 
              }}></Lightbox>
            {/* </Box> */}
            </Stack>



            :<DSIMGAnnotorious image = {imgURLs[index]}/>)
        }
      </>
  );
}