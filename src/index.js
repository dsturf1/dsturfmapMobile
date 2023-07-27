import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter } from "react-router-dom";
import { Amplify, Auth } from 'aws-amplify';

Amplify.configure({
  Auth: {
    identityPoolId: 'us-east-1:81ad79da-011a-4b19-8324-1e6528d1667e',

    region: 'us-east-1' ,// (optional) Default region for project
    userPoolId: 'us-east-1_lAx7wEsPv', // (optional) -  Amazon Cognito User Pool ID
    userPoolWebClientId: '471eh9d578sr95vm4ksjr53f62', // (optional) - Amazon Cognito App Client ID (App client secret needs to be disabled)
    mandatorySignIn: 'enable' // (optional) - Users are not allowed to get the aws credentials unless they are signed in
  },

  Storage: { 
    bucket: 'dsmapdata',
    region: 'us-east-1',
    identityPoolId: 'us-east-1:81ad79da-011a-4b19-8324-1e6528d1667e'
   }
 }

);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
