// import DSMainMap from "./components/DSMainMap.js";
import DSSearchMain from "./components/DSSearch/DSSearchMain.js";
import DSNaverMain from "./components/DSNaver/DSNaverMain.js";
import DSKakaoMain from "./components/DSKakao/DSKakaoMain.js";
import DSWorkMain from "./components/DSWork/DSWorkMain.js";
import DSGeoJsonMain from "./components/DSGeoJson/DSGeoJsonMain.js";
import DSMapSettingMain from "./components/DSSetting/DSMapSettingMain.js";
// import DSIMGLabelMain from "./components/DSIMGLabel/DSIMGLabelMain.js";
import ResponsiveAppBar from './components/ResponsiveAppBar';
import React, { Fragment} from 'react';
import { Routes, Route } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BaseProvider} from "./context/BaseData.js"
import { MapQProvider} from "./context/DSMapData.js"
import { LabelProvider} from "./context/DSLabelData.js"

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { MapCRSQProvider } from "./context/DSCRSData.js";
import DSIMGLabelMain from "./components/DSIMGLabel/DSIMGLabelMain.js";



const DSTheme = createTheme({
  typography: {
    subtitle1: {
      fontSize: 12,
    },
    body1: {
      fontWeight: 500,
    },
    button: {
      fontStyle: 'italic',
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#035efc',
    },
    secondary: {
      main: '#f50057',
    },
  },
});


const App = () => {
	return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
      <Fragment>
        < BaseProvider user = {user}>
          <MapCRSQProvider>
          <MapQProvider>
          {/* <LabelProvider> */}
          <ThemeProvider theme={DSTheme}>
            <CssBaseline />
            <ResponsiveAppBar signOut = {signOut} user = {user.username}/>
            <Routes>
              <Route path="/" element={    <DSWorkMain geojson_mode={"JOBS"}/>}></Route>
              {/* <Route path="/" lement={<DSIMGLabelMain/>}></Route> */}
              {/* <Route path="dssearch" element={    <DSSearchMain/>}></Route> */}
              {/* <Route path="dsnaver" element={<DSNaverMain />}></Route> */}
              {/* <Route path="dskakao" element={<DSKakaoMain />}></Route> */}
              <Route path="dsmapedit" element={<DSGeoJsonMain geojson_mode={"AREA"}/>}></Route>
              {/* <Route path="dsjobsedit" element={<DSGeoJsonMain geojson_mode={"JOBS"}/>}></Route> */}
              <Route path="dsworkedit" element={<DSWorkMain geojson_mode={"JOBS"}/>}></Route>
              {/* <Route path="dsimglabel" element={<DSIMGLabelMain/>}></Route> */}
              <Route path="dssetting" element={<DSMapSettingMain/>}></Route>
              {/* <Route path="dscourses" element={<DSBaseCourseMain />}></Route>
              <Route path="dshuman" element={<DSBaseHumanMain />}></Route>
              <Route path="dsother" element={<DSBaseOtherMain />}></Route> */}
            </Routes>
          </ThemeProvider>
          {/* </LabelProvider> */}
          </MapQProvider>
          </MapCRSQProvider>
        </BaseProvider>
      </Fragment>
      )}
    </Authenticator>
  )
};

export default App;
