import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';

import {connect} from 'react-redux';

//import CityList from './CityList.js';

// Styles
import '../../styles/WorldMap.css';

// Images
//import pin from '../../img/map-pin.png';
//import pinActive from '../../img/map-pin-active.png';


// Passes the map instance to the OverlayViewContainer allowing React to
// control the content of map overlays.
const MapContext = React.createContext(null);

/**
 * The class controlling the display of the map component and its overlays
 * @extends React.Component
 */
class GoogleMap extends React.Component {

  constructor(props) {
    super(props);

    // References to the Google Maps map object, and the mapContainer DOM element
    this.state = { map: null };
    this.mapContainer = React.createRef();

  }

  /**
   * React component lifecycle method
   */
  componentDidMount() {

    // Include map dependencies
    // const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    //
    // var mapScript = document.createElement('script');
    // mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
    // mapScript.defer = true;
    // mapScript.async = true;

    //document.head.appendChild(mapScript);

    // Callback script to instantiate the map
    (window.initMap = () => {

      let map = new window.google.maps.Map(this.mapContainer.current, {
        center: { lat: 20, lng: 25 },
        zoom: 3
      });

      this.setState({ map: map });

    })();
  }

  componentWillUnmount() {
    this.setState({ map: null });
  }

  render() {

    return (
      <Fragment>
        <div ref={this.mapContainer} className="worldMap" id="worldMap"></div>
        <MapContext.Provider value={this.state.map}>{this.props.children}</MapContext.Provider>
      </Fragment>
    );

  }
}


/**
 * React Context consumer component to hold custom map overlays whose content
 * can be controlled by React.
 * @extends React.Component
 */
class OverlayViewContainer extends React.Component {

  constructor(props) {
    super(props);

    this.el = document.createElement('div');
    this.el.style.position = 'absolute';
    this.el.style.display = 'inline-block';
    this.el.style.width = '100px';
    this.el.style.backgroundColor = 'red';

    this.overlay = null;
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    // Remove the overlay from the map
    this.overlay.setMap(null);
    delete this.overlay;
  }

  render() {

    this.el.innerHTML = this.props.playerid;

    return (
      <MapContext.Consumer>
        {
          (map) => {
            if(map) {

              this.overlay = new MapOverlay({ position: this.props.position, content: this.el });

              this.overlay.setMap(map);


              return ReactDOM.createPortal(this.props.children, this.el);

            } else {
              return null;
            }
          }
        }
      </MapContext.Consumer>
    );
  }
}


/** TODO TIDY UP
 * Creates a new overlay element for the game, based on the base Google Maps
 * class `OverlayView`. Wrapped in a function so it can be defined in a callback
 * when the map library is ready.
 * @extends google.maps.OverlayView
 */
class MapOverlay extends window.google.maps.OverlayView {
    position = null;
    content = null;

    constructor(props) {
      super(props);
      props.position && (this.position = props.position);
      props.content && (this.content = props.content);
    }

    /** Called when the popup is added to the map. */
    onAdd = () => {
      this.getPanes().floatPane.appendChild(this.content);
    };

    /** Called when the popup is removed from the map. */
    onRemove = () => {
      if (this.content.parentElement) {
        this.content.parentElement.removeChild(this.content);
      }
    };

    /** Called each frame when the popup needs to draw itself. */
    draw = () => {
      const divPosition = this.getProjection().fromLatLngToDivPixel(
        this.position
      );
      this.content.style.left = divPosition.x + 'px';
      this.content.style.top = divPosition.y + 'px';
    };
  }



/**
 * Finally: Composes all the elements of the map and renders them.
 * @extends React.Component
 */
class WorldMap extends React.Component {

  render() {
    return(
      <Fragment>
        <GoogleMap>
          <OverlayViewContainer playerid={this.props.localPlayer._id} position={new window.google.maps.LatLng(0, 0)}>

          </OverlayViewContainer>
        </GoogleMap>
      </Fragment>
    );
  }

}

// Redux Store Data
const mapStateToProps = (state) => {
  return {
    //cityData: state.cityData
    localPlayer: state.localPlayer
  }
}

export default connect(
  mapStateToProps
)(WorldMap);
