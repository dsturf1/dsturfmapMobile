// import DSMainMap from "./components/DSMainMap.js";
import DSSearchMain from "./components/DSSearch/DSSearchMain.js";
import DSNaverMain from "./components/DSNaver/DSNaverMain.js";
import DSJobsMain from "./components/DSJobs/DSJobsMain.js";
import DSGeoJsonMain from "./components/DSGeoJson/DSGeoJsonMain.js";
import DSMapSettingMain from "./components/DSSetting/DSMapSettingMain.js";
import ResponsiveAppBar from './components/ResponsiveAppBar';
import React, { Fragment} from 'react';
import { Routes, Route } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BaseProvider} from "./context/BaseData.js"
import { MapQProvider} from "./context/DSMapData.js"

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const DSTheme = createTheme({
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
          <MapQProvider>
          <ThemeProvider theme={DSTheme}>
            <CssBaseline />
            <ResponsiveAppBar signOut = {signOut} user = {user.username}/>
            <Routes>
              <Route path="/" element={    <DSSearchMain/>}></Route>
              <Route path="dssearch" element={    <DSSearchMain/>}></Route>
              {/* <Route path="dsnaver" element={<DSNaverMain />}></Route> */}
              <Route path="dsmapedit" element={<DSGeoJsonMain geojson_mode={"AREA"}/>}></Route>
              <Route path="dsjobsedit" element={<DSGeoJsonMain geojson_mode={"JOBS"}/>}></Route>
              {/* <Route path="dsmapedit" element={<DSMapMain/>}></Route> */}
              <Route path="dssetting" element={<DSMapSettingMain/>}></Route>
              {/* <Route path="dscourses" element={<DSBaseCourseMain />}></Route>
              <Route path="dshuman" element={<DSBaseHumanMain />}></Route>
              <Route path="dsother" element={<DSBaseOtherMain />}></Route> */}
            </Routes>
          </ThemeProvider>
          </MapQProvider>
        </BaseProvider>
      </Fragment>
      )}
    </Authenticator>
  )
};

export default App;
