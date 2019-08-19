import React, {useState} from 'react';
import {usePosition} from 'use-position';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import GoogleMapReact from 'google-map-react';
import RoomIcon from '@material-ui/icons/Room';
import BackspaceIcon from '@material-ui/icons/Backspace';
import LocalCafeIcon from '@material-ui/icons/LocalCafe';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';

import topImg from './top.jpg';

const useStyles = makeStyles(theme => ({
  top: {
    minHeight: '100vh',
    width: '100vw',
  },
  topImg: {
    position: 'relative',
    width: '100vw',
  },
  search: {
    position: 'relative',
    display: 'flex',
    flexGrow: 0,
    justifyContent: 'center',
  },
  sticky: {
    zIndex: 2,
    position: 'sticky',
    top: 0,
  },
  toolbar: theme.mixins.toolbar,
  map: {
    position: 'relative',
    height: '60vw',
    width: '100vw',
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
    border: '1px solid #fff',
    borderRadius: 20,
    fontSize: 14,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#000',
  },
  content: {
    position: 'relative',
    top:0,
    flexGrow: 1,
  },
  detailSticky:{
    zIndex: 3,
    position: 'sticky',
    top: 0,
  },
  photoRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  cafeCard: {
    display: 'flex',
    padding: theme.spacing(1),
  },
  detailCard: {
    padding: theme.spacing(1),
  },
  cafeDetail: {
    display: 'flex',
  },
  cardImg: {
    width: 120,
    height: 120,
  },
  avatar: {
    position: 'absolute',
    margin: 2,
    color: '#fff',
    backgroundColor: '#000',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MAP_API_KEY = process.env.REACT_APP_MAP_API_KEY;

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

  const handleNearbySearch = ()=>{
    const request = {
      location: myLatLng,
      radius: '600',//bydistanceだとkioskとかも入ってしまう
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
            place_id: res[i].place_id,
          })
        }
        setCafes(cafesArray);//これでhooksに入れられる
      }else{
        setNoCafe(true);
      }
    }));
  };

  return(
    <div className={classes.top}>
      <div className={classes.toolbar}/>
      <div>
        <img src={topImg} alt="topImage" className={classes.topImg} />
        <Typography align="left" variant="h6">あなたの現在地から徒歩10分以内のカフェを探すことができます。</Typography>
        <Typography align="left" variant="h6">地図上でInstagramの写真を見ながらお気に入りのカフェを探しましょう。</Typography>
      </div>
      <div>
        <Button variant="contained" color="inherit" fullWidth onClick={handleNearbyOpen} className={classes.search}>カフェを探す</Button>
        <Typography align="left" variant="subtitle2">※ブラウザの位置情報サービスをオンにしてください</Typography>
      </div>
      <Dialog fullScreen open={props.openData} scroll="body" TransitionComponent={Transition}>
        <div className={classes.sticky}>
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
        <div className={classes.content}>
          { noCafe && <Typography>徒歩圏内にカフェはありません</Typography>}
          {console.log(cafes)/*開発用*/}
          {cafes.map((cafe, key)=>{
            return(
              <CafeCard info={cafe} key={key}/>
            )
          })}
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
  const mapLink = "https://www.google.com/maps/place/?q=place_id:" + props.info.place_id;

  const getData = async ()=>{
    let urls=[];
    await axios
      .get(`https://www.instagram.com/explore/tags/${props.info.name}/`)
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

  const handleDetailOpen = ()=>{
    getData();
    setOpenDetail(true);
  };
  const handleDetailClose = ()=>{
    setOpenDetail(false);
  };

  return(
    <>
      <Avatar className={classes.avatar}>{props.info.id}</Avatar>
      <Card square elevation={0} onClick={handleDetailOpen} className={classes.cafeCard}>
        <CardMedia component="img" src={topImg} className={classes.cardImg}/>
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
          <Card square elevation={0} className={classes.detailCard}>
            <div className={classes.cafeDetail}>
              <CardMedia component="img" src={topImg} className={classes.cardImg}/>
              <CardContent>
                <Typography>{props.info.name}</Typography>
                {openNow && <Typography color="error">開店中</Typography>}
                <Typography>Rating : {props.info.rating}</Typography>
              </CardContent>
            </div>
            <CardContent>
              <Typography>adress: {props.info.vic}</Typography>
              <Button variant="outlined" component="a" href={mapLink}>Google Mapで表示する</Button>
            </CardContent>
          </Card>
        </div>
        <Divider />
        <div className={classes.photoRoot}>
          { noPhoto && <Typography>写真がありません</Typography>}
          <GridList cellHeight={150} cols={3} spacing={2}>
            {photoURLs.map((url, key)=>{
              return(
                <GridListTile key={key}>
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