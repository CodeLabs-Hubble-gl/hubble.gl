import React, {useState, useRef, useEffect} from 'react';
import DeckGL from '@deck.gl/react';
import {DeckAdapter} from '@hubble.gl/core';
import {useNextFrame, BasicControls, ResolutionGuide} from '@hubble.gl/react';
import {sceneBuilder} from './scene';
//import {layers} from './layers';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {StaticMap} from 'react-map-gl';
import {PolygonLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';

// Try to make it draggable

import {Controller} from 'deck.gl';

/*class MapController extends Controller {
    constructor(options = {}) {
        super(MyViewState, options);
    }
}
*/

// Source data CSV
const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/trips-v7.json' // eslint-disable-line
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};

const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  pitch: 45,
  bearing: 0,
  id: "initialViewState"
};

const landCover = [[[-74.0, 40.7], [-74.02, 40.7], [-74.02, 40.72], [-74.0, 40.72]]];


/** @type {import('@hubble.gl/core/src/types').FrameEncoderSettings} */
const encoderSettings = {
  framerate: 30,
  webm: {
    quality: 1
  },
  jpeg: {
    quality: 0.8
  },
  gif: {
    sampleInterval: 1000
  }
};


let adapter = new DeckAdapter(sceneBuilder);

export default function App({
  buildings = DATA_URL.BUILDINGS,
  trips = DATA_URL.TRIPS,
  trailLength = 180,
  initialViewState = INITIAL_VIEW_STATE,
  mapStyle = 'mapbox://styles/mapbox/dark-v9',
  theme = DEFAULT_THEME,
  loopLength = 1800, // unit corresponds to the timestamp in source data
  animationSpeed = 1
}) {

  const deckgl = useRef(null);
  const map = useRef(null);

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const nextFrame = useNextFrame();

  // Why it uses this?
  const [time, setTime] = useState(0);
  const [animation] = useState({});
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [enabled, setEnabled] = useState(false);

  const animate = () => {
    setTime(t => (t + animationSpeed) % loopLength);
    animation.id = window.requestAnimationFrame(animate);
  };

 

  useEffect(
    () => {
      animation.id = window.requestAnimationFrame(animate);
      return () => window.cancelAnimationFrame(animation.id);
    },
    [animation]
  );

  const layers = [
    new PolygonLayer({
      id: 'ground',
      data: landCover,
      getPolygon: f => f,
      stroked: false,
      getFillColor: [0, 0, 0, 0]
    }),
    new TripsLayer({
      id: 'trips',
      data: DATA_URL.TRIPS,
      getPath: d => d.path,
      getTimestamps: d => d.timestamps,
      getColor: d => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      trailLength: 180,
      currentTime: time,
  
      shadowEnabled: false
    }),
    new PolygonLayer({
      id: 'buildings',
      data: DATA_URL.BUILDINGS,
      extruded: true,
      wireframe: false,
      opacity: 0.5,
      getPolygon: f => f.polygon,
      getElevation: f => f.height,
      getFillColor: theme.buildingColor,
      material: theme.material
    })
  ];

  const onChecked = (e) => {
    const checked = e.target.checked;
    if (checked) {
      adapter.scene.keyframes.camera.values[0].latitude = viewState.latitude;
      adapter.scene.keyframes.camera.values[0].longitude = viewState.longitude;
      adapter.scene.keyframes.camera.values[0].pitch = viewState.pitch;
      adapter.scene.keyframes.camera.values[0].zoom = viewState.zoom;
      adapter.scene.keyframes.camera.values[0].bearing = viewState.bearing;

      adapter.scene.keyframes.camera.values[1].latitude = viewState.latitude;
      adapter.scene.keyframes.camera.values[1].longitude = viewState.longitude;
      adapter.scene.keyframes.camera.values[1].pitch = viewState.pitch;
      adapter.scene.keyframes.camera.values[1].zoom = viewState.zoom;
      adapter.scene.keyframes.camera.values[1].bearing = viewState.bearing + 90;


    }else{
   //  adapter.scene.animationLoop.timeline.setTime(adapter.videoCapture.encoderSettings.startOffsetMs);
     adapter.scene.animationLoop.timeline.setTime(0);

    }
    setEnabled(checked)

  }


  

  return (
    <div style={{position: 'relative'}}>
      <div style={{position: 'absolute'}}>
        <ResolutionGuide />
      </div>
      
      <DeckGL
      ref={deckgl}
      layers={layers}
      effects={theme.effects}
    //  initialViewState = {initialViewState}

        controller = {true}
        width= {640}
        height= {480}
        viewState={viewState}
       onViewStateChange={({ viewState }) => {
         

     /*   deckgl.current.deck.setProps({viewState});
        map.current._map.jumpTo({
            center: [viewState.longitude, viewState.latitude],
            zoom: viewState.zoom,
            bearing: viewState.bearing,
            pitch: viewState.pitch
        });
        deckgl.current.viewState = { ...viewState };*/

        console.log("adapter",adapter);

      
        setViewState(viewState)
      }}
    
      {...adapter.getProps(deckgl, setReady, nextFrame, enabled)}
    >
      <StaticMap
        ref={map}
        reuseMaps
        mapStyle={mapStyle}
        preventStyleDiffing={true}
        mapboxApiAccessToken="pk.eyJ1IjoicGlvbmVlci1tZSIsImEiOiJjanA0OXMwM2IwcW5qM2tvYnAyYndpdXMxIn0.bqxGkqM2ozOVT57GuVzEjw" 
      />
    </DeckGL>



      <div style={{position: 'absolute'}}>
        {ready && (
          <BasicControls
            adapter={adapter}
            busy={busy}
            setBusy={setBusy}
            encoderSettings={encoderSettings}
          
          />
        )}
        <input type="checkbox" checked={enabled} onChange={onChecked} ></input>
      </div>
    </div>
  );
}
