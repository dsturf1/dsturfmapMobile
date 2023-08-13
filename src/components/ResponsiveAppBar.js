import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import { deepOrange, deepPurple, red , blue, indigo} from '@mui/material/colors';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DSicon1 from './DSicon1.js';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { Link } from "react-router-dom";


import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MuiToggleButton from "@mui/material/ToggleButton";
import { styled } from "@mui/material/styles";

const ToggleButton = styled(MuiToggleButton)({
  "&.Mui-selected, &.Mui-selected:hover": {
    color: "white",
    backgroundColor: indigo[900]
  }
});

const pages = [
  // {name:'일정작성', url:'dsschedule'},
  {name:'골프장검색', url:'dssearch'},
  {name:'등록골프장구역설정', url:'dsmapedit'},
  {name:'등록골프장관심영역설정', url:'dsjobsedit'},
  // {name:'Naver', url:'dsnaver'},
  // {name:'방제일지보기', url:'dswork'},
  {name:'설정', url:'dssetting'}
  // {name:'일정작성', url:'dsschedule'},
  // {name:'직원등록', url:'dshuman'},
  // {name:'기타등록', url:'dsother'},
];


function ResponsiveAppBar({signOut, user}) {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  return (
    <AppBar position="static">
      {/* <Container maxWidth="xl"> */}
        <Toolbar disableGutters 
          sx={{
            p: 2,
            height: 20,
            minHeight:20
          }}>
          <DSicon1 sx={{ display: { xs: 'flex', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'flex' },
              fontFamily: 'roboto',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            동성그린
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'flex' } }}>
          <ToggleButtonGroup>
            {pages.map((page, index)=> (
              <ToggleButton
                key={page.name}
                onClick={()=>{setSelectedIndex(index);}}
                sx={{ my: 2, color: 'white', display: 'block' }}
                selected={selectedIndex === index}
              >
                <Link style = {{textDecoration:'none', color:'white', fontSize: 15}} to = {page.url}>{page.name}
                </Link>
              </ToggleButton>
            ))}
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Stack  direction="row"  divider={<Divider orientation="vertical" flexItem />}  spacing={2}>
              <Tooltip title="Log Out">
                <IconButton onClick={()=>signOut()} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: blue[500]}}> <ExitToAppIcon/> </Avatar>
                </IconButton>
              </Tooltip>
              <Typography textAlign="center">{user}</Typography>
            </Stack>
          </Box>
        </Toolbar>
      {/* </Container> */}
    </AppBar>
  );
}
export default ResponsiveAppBar;