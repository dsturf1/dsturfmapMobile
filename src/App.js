
import DSWorkMain from "./components/DSWork/DSWorkMain.js";
import React, { Fragment} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BaseProvider} from "./context/BaseData.js"
import { MapQProvider} from "./context/DSMapData.js"
import { LabelProvider} from "./context/DSLabelData.js"

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { MapCRSQProvider } from "./context/DSCRSData.js";


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
            <DSWorkMain signOut = {signOut}/>
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
