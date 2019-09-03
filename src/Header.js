import React, {useState} from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Backspace from '@material-ui/icons/Backspace';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  toolbar: theme.mixins.toolbar,
  button: {
    position: "absolute",
    zIndex: 2000,
  },
  appBar: {
    position: 'fixed',
    top: 0,
    zIndex: 2000,
  },
  title:{
    position: 'relative',
    width: '100vw',
    flexGrow: 1,
  },
}));

const Header = (props)=>{
  const classes = useStyles();
  const [state, setState] = useState(false);
  const [about, setAbout] = useState(false);

  return(
    <div className={classes.root}>
      <AppBar color="default" square elevation={1} className={classes.appBar}>
        <Toolbar>
          <IconButton className={classes.button} color="inherit" aria-label="Menu" onClick={()=>{setState(true)}}>
            <MenuIcon />
          </IconButton>
          <Typography align="center" className={classes.title} variant="h5" onClick={()=>{props.setOpenData(false);setState(false);}}>
            Coffee Map beta
          </Typography>
          <Dialog fullScreen open={state}>
            <div className={classes.toolbar}/>
            <List>
              <ListItem button onClick={()=>{setState(false)}}>
                <ListItemIcon>
                  <Backspace/>
                </ListItemIcon>
              </ListItem>
              <ListItem button onClick={()=>{setAbout(true)}}>
                <ListItemText primary="About" />
              </ListItem>
              <Dialog fullScreen open={about}>
                <div className={classes.toolbar}/>
                <ListItem button onClick={()=>{setAbout(false)}}>
                  <ListItemIcon>
                    <Backspace/>
                  </ListItemIcon>
                </ListItem>
                <Divider/>
                <Typography>Coffee Mapは現在開発中です。ご理解とご協力お願いいたします。</Typography>
                <Typography>Supported by <a href="https://api.gnavi.co.jp/api/scope/" target="_blank">ぐるなびWebService</a></Typography>
              </Dialog>
              <ListItem button component="a" href="https://forms.gle/NkeF1fz41QF9iY7p8">
                <ListItemText primary="お問い合わせ" />
              </ListItem>
            </List>
          </Dialog>
        </Toolbar>
      </AppBar>
    </div>
  )
};

export default Header