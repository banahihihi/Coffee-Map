import React,{useState}  from 'react';
import Header from './Header';
import Main from './Main';

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import brown from '@material-ui/core/colors/brown';
import green from '@material-ui/core/colors/green';


const theme = createMuiTheme({//茶色はクソダサい、白黒でもいいんじゃない
  palette: {
    primary: {
      main: brown[500],
    },
    secondary: {
      main: green[500],
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
});

function App() {
  const [openData, setOpenData] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Header openData={openData} setOpenData={setOpenData}/>
      <Main openData={openData} setOpenData={setOpenData}/>
    </ThemeProvider>
  );
}

export default App;
