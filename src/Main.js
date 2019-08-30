import React, {useState} from 'react';
import {usePosition} from 'use-position';
import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/firestore';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import GoogleMapReact from 'google-map-react';
import RoomIcon from '@material-ui/icons/Room';
import BackspaceIcon from '@material-ui/icons/Backspace';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';

import topImg from './top.jpg';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: '100vh',
    width: '100vw',
  },
  topImg: {
    position: 'relative',
    height: '40vh',
    width: '100vw',
    backgroundImage: `url(${topImg})`,
    backgroundSize: 'cover',
  },
  search: {
    position: 'relative',
    display: 'flex',
  },
  toolbar: theme.mixins.toolbar,
  dialogRoot: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'row-reverse',
    },
  },
  mapRoot: {
    zIndex: 2,
    position: 'sticky',
    top: 0,
    [theme.breakpoints.up('sm')]: {
      flexGrow: 1,
      height: '100vh',
      width: 'auto',
    },
  },
  map: {
    position: 'relative',
    height: '30vh',
    width: '100vw',
    [theme.breakpoints.up('sm')]: {
      position: 'relative',
      height: '100%',
      width: '100%',
    },
  },
  imHere:{
    position: 'absolute',
    width: 25,
    height: 25,
    transform: 'translate(-50%, -100%)',
    zIndex: 4,
  },
  marker: {
    position: 'absolute',
    width: 20,
    height: 20,
    transform: 'translate(-50%, -50%)',
    border: '1px solid black',
    borderRadius: 20,
    fontSize: 14,
    textAlign: 'center',
    color: 'black',
    backgroundColor: 'white',
  },
  contentRoot: {
    [theme.breakpoints.up('sm')]: {
      width: 360,
    },
  },
  content: {
    [theme.breakpoints.up('sm')]: {

    },
  },
  detailSticky:{
    zIndex: 3,
    position: 'sticky',
    top: 0,
    backgroundColor: "white",
  },
  cafeCard: {
    display: 'flex',
    height: 120,
    padding: theme.spacing(1),
  },
  detailCard: {
    padding: theme.spacing(1),
  },
  cafeDetail: {
    display: 'flex',
  },
  cardImg: {
    width: 'auto',
    height: '100%'
  },
  avatar: {
    position: 'absolute',
    margin: 2,
    color: 'black',
    backgroundColor: 'white',
    border: '1px solid black',
  },
  photoRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    maxWidth: 600,
    flexGrow: 1,
  },
  photoTile: {
    height: '33vw !important',
    [theme.breakpoints.up('sm')]: {
      height: '200px !important',
    },
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MAP_API_KEY = process.env.REACT_APP_MAP_API_KEY;

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
});
const db = firebase.firestore();

const Main = (props)=>{
  const classes = useStyles();
  //const [search, setSearch] = useState(false);
  const [myLocation, setMyLocation] = useState({});
  //const [placesService,setPlacesService] = useState({});
  //const [myLatLng,setMyLatLng] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [noCafe, setNoCafe] = useState(false);//これもcafesに入れたい

  const { latitude, longitude, timestamp, accuracy, error } = usePosition();
  let myLoc={lat: latitude, lng: longitude}
  let placesService;
  let myLatLng;
  /*
  const handleSearchOpen = ()=>{//入力からlat,lngをmyLocationに代入
    setSearch(true);
  };
  const handleSearchClose = ()=>{
    setSearch(false);
  };
  */
  const handleNearbyOpen = ()=>{
    setMyLocation(myLoc);
    props.setOpenData(true);
  };

  const handleApiLoaded = (map, maps)=>{
    if(map && maps){
      placesService = new maps.places.PlacesService(map);
      myLatLng =  new maps.LatLng(myLocation.lat, myLocation.lng);
      handleNearbySearch();//なぜかnew関数がグローバルで渡せないからここで動作させる
    }
  };

  const handleNearbySearch = async ()=>{//firebaseからサーチしてる、現在地からの距離で条件付けたい
    let cafesArray;
    await db.collection('cafes')
      .get()
      .then((res)=>{
        cafesArray = res.docs.map(doc => doc.data());//このdoc.data()でオブジェクトの配列を得られる
        for(let i=0;i<cafesArray.length;i++){
          cafesArray[i].id = i+1;
        }
        console.log(cafesArray);
      });
    setCafes(cafesArray);
  };

/*
  const handleNearbySearch = ()=>{//GoogleMapへのリクエスト＆読み取り ここをFirestoreに書き込みたい
    const request = {
      location: myLatLng,
      radius: '800',//bydistanceだとkioskとかも上位に入ってしまう
      type: ['cafe'],
    };
  
    placesService.nearbySearch(request, ((res,status,pagination)=>{
      if(status === "OK"){
        console.log(status,pagination,res); //開発用
        let cafesArray=[];
        for(let i=0; i<res.length; i++){
          cafesArray.push({
            id: i+1,
            name: res[i].name,
            lat: res[i].geometry.location.lat(),
            lng: res[i].geometry.location.lng(),
            vic: res[i].vicinity,//住所
            rating: res[i].rating,
            oh: res[i].opening_hours,
            placeId: res[i].place_id,
          })
        }
        setCafes(cafesArray);//これでhooksに入れられる
      }else{
        setNoCafe(true);
      }
    }));
  };
*/
  return(
    <div className={classes.root}>
      <div className={classes.toolbar}/>
      <div>
        <div className={classes.topImg}/>{/*backgroundImgで写真を描写してる backgroundSize:coverを使うため */}
        <Typography align="left" variant="h6">あなたの現在地から徒歩10分以内のカフェを探すことができます。</Typography>
        <Typography align="left" variant="h6">地図上でInstagramの写真を見ながらお気に入りのカフェを探しましょう。</Typography>
        <Button variant="contained" color="inherit" fullWidth onClick={handleNearbyOpen} className={classes.search}>カフェを探す</Button>
        <Typography align="left" variant="subtitle2">※ブラウザの位置情報サービスをオンにしてください</Typography>
      </div>
      <Dialog fullScreen open={props.openData} scroll="body" TransitionComponent={Transition}>
        <div  className={classes.dialogRoot}>
        <div className={classes.mapRoot}>
          <div className={classes.toolbar}/>
          <div className={classes.map}>
            <GoogleMapReact
              bootstrapURLKeys={{
                key: MAP_API_KEY,
                libraries: ['places']
              }}
              center={{lat: myLocation.lat, lng: myLocation.lng}}
              defaultZoom={15}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
            >
              <ImHere lat={myLocation.lat} lng={myLocation.lng}/>
              {cafes.map((cafe, key)=>{
                return(
                  <CafeMarker lat={cafe.lat} lng={cafe.lng} info={cafe} key={key}/>
                )
              })}
            </GoogleMapReact>
          </div>
        </div>
        <div className={classes.contentRoot}>
          <Hidden xsDown><div className={classes.toolbar}/></Hidden>
          <div className={classes.content}>
            { noCafe && <Typography>徒歩圏内にカフェはありません</Typography>}
            {console.log(cafes)/*開発用*/}
            {cafes.map((cafe, key)=>{
              return(
                <CafeCard info={cafe} key={key}/>
              )
            })}
          </div>
        </div>
        </div>
      </Dialog>
    </div>
  )
};

const ImHere = ()=>{
  const classes = useStyles();
  return(
    <div className={classes.imHere}>
      <RoomIcon color="error"/>
    </div>
  )
};
const CafeMarker = (props)=>{
  const classes = useStyles();
  return(
    <div className={classes.marker}>{props.info.id}</div>
  )
};


const CafeCard = (props)=>{
  const classes = useStyles();
  const [openDetail, setOpenDetail] = useState(false);
  const [photoURLs, setPhotoURLs] = useState([]);
  const [noPhoto, setNoPhoto] = useState(false);
  const openNow = props.info.oh && props.info.oh.open_now;
  const mapLink = "https://www.google.com/maps/place/?q=place_id:" + props.info.placeId;
  const hashtagLink = `https://www.instagram.com/explore/tags/${props.info.name}/`;

/*
  const getData = async ()=>{//ここもfirestoreに入れたい
    let urls=[];
    await axios
      .get(hashtagLink)
      .then((res)=>{
        let json_string = res.data.split(/window\._sharedData = (.*);<\/script>/g)[1].trim();
        let Arrya_data = JSON.parse(json_string);
        let datas = Arrya_data.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges;
        for (let i=0;i< datas.length;i++){
          urls.push({
            displayUrl: datas[i].node.display_url,
            shortCode: datas[i].node.shortcode, //写真をクリックしてinstagramに飛びたい
          });
        }
      })
      .catch(()=>{setNoPhoto(true)})
    setPhotoURLs(urls);
  };
*/

  const handleDetailOpen = ()=>{
    //getData();
    setOpenDetail(true);
  };
  const handleDetailClose = ()=>{
    setOpenDetail(false);
  };

  return(
    <>
      <Avatar className={classes.avatar}>{props.info.id}</Avatar>
      <Card square elevation={0} onClick={handleDetailOpen} className={classes.cafeCard}>
        <CardMedia component="img" src={topImg}  className={classes.cardImg}/>
        <CardContent>
          <Typography>{props.info.name}</Typography>
          {openNow && <Typography color="error">開店中</Typography>}
          <Typography>Rating : {props.info.rating}</Typography>
        </CardContent>
      </Card>
      <Divider />
      <Dialog fullScreen open={openDetail} scroll="body" TransitionComponent={Transition}>       
        <div className={classes.detailSticky}>
          <div className={classes.toolbar}/>
          <Avatar className={classes.avatar} onClick={handleDetailClose}><BackspaceIcon/></Avatar>
          <Card square elevation={0} className={classes.cafeCard}>
            <CardMedia component="img" src={topImg} className={classes.cardImg}/>
            <CardContent>
              <Typography>{props.info.name}</Typography>
              {openNow && <Typography color="error">開店中</Typography>}
              <Typography>Rating : {props.info.rating}</Typography>
            </CardContent>
          </Card>
          <div style={{display: 'flex'}}>
            <Button variant="outlined" component="a" href={mapLink}>Google Map</Button>
            <Button variant="outlined" component="a" href={hashtagLink}>InstaGram</Button>
          </div>
        </div>
        <Divider />
        <div className={classes.photoRoot}>
          { noPhoto && <Typography>写真がありません</Typography>}
          <GridList cellHeight="auto" cols={3} spacing={3} className={classes.gridList}>
            {photoURLs.map((url, key)=>{
              return(
                <GridListTile key={key} className={classes.photoTile}>
                  <img src={url.displayUrl} alt="cafePhoto"/>
                </GridListTile>
              )
            })}
          </GridList>
        </div>
      </Dialog>
    </>
  )
};

export default Main;