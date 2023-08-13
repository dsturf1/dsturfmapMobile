import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import { deepOrange, deepPurple } from '@mui/material/colors';
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
import DSicon1 from './DSicon1.js';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { Link } from "react-router-dom";

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

const settings = ['Logout'];

function ResponsiveAppBar({signOut, user}) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const userAction = (props)=>{
    if(props === 'Logout') signOut();
      console.log(props)
  }
  

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters 
        sx={{
          // bgcolor: 'background.paper',
          // boxShadow: 1,
          // borderRadius: 2,
          p: 2,
          height: 20,
          minHeight:20
        }}>
          <DSicon1 sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'roboto',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            동성그린
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu} to={page.url} component={Link}>
                  <Typography textAlign="center">{page.name}  
                  </Typography>                  
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {/* <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} /> */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'roboto',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            동성그린
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page, index)=> (
              <Button
                key={page.name}
                onClick={()=>{handleCloseNavMenu(); setSelectedIndex(index);}}
                sx={{ my: 2, color: 'white', display: 'block' }}
                selected={selectedIndex === index}
              >
                <Link style = {{textDecoration:'none', color:'white', fontSize: 15}} to = {page.url}>{page.name}</Link>
              </Button>

            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Stack  direction="row"  divider={<Divider orientation="vertical" flexItem />}  spacing={2}>
                <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: deepPurple[500]}}> <AgricultureIcon/> </Avatar>
                </IconButton>
                </Tooltip>
                <Typography textAlign="center">{user}</Typography>
            </Stack>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={()=>{userAction(setting);handleCloseUserMenu()}}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;