import React, {Fragment} from 'react';

import {connect} from 'react-redux';

import CityList from './CityList.js';

// Styles
import '../../styles/WorldMap.css';

// Images
import pin from '../../img/map-pin.png';
import pinActive from '../../img/map-pin-active.png';

class WorldMap extends React.Component {

  constructor(props) {
    super(props);

    this.map = null;

    // Create a property to hold references to all the markers on the map
    this.mapMarkers = {
      cities: []
    };

    // And a property to hold the current active marker.
    this.activeMarker = null;

    // Bind `this`
    this.activateMarker = this.activateMarker.bind(this);
    this.deactivateActiveMarker = this.deactivateActiveMarker.bind(this);
    this.addMarker = this.addMarker.bind(this);
    this.placeCityMarkers = this.placeCityMarkers.bind(this);

  }

  /**
   * React component lifecycle method
   */
  componentDidMount() {

    // Include map dependencies
    const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    var mapScript = document.createElement('script');
    mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
    mapScript.defer = true;
    mapScript.async = true;

    document.head.appendChild(mapScript);

    // Callback script to instantiate the map
    window.initMap = () => {

      this.map = new window.google.maps.Map(document.getElementById('worldMap'), {
        center: { lat: 20, lng: 25 },
        zoom: 3
      });

      // Place markers
      this.placeCityMarkers();

    }
  }

  componentWillUnmount() {
    this.map = null;
  }

  /**
   * Adds a marker to the map, optionally including an info window
   * @param   {String}     type        The first level of the markers array is an object
   *                                   representing the group of markers to add to.
   * @param   {String}     key         The key name to set in the markers second-level
   *                                   array.
   * @param   {Marker}     marker      Google Maps marker object.
   * @param   {InfoWindow} infoWindow  Google Maps InfoWindow object
   * @return  {Object}                 The reference to the marker added
   */
  addMarker(type, key, marker, infoWindow = null) {

    // Add the marker and info window
    this.mapMarkers[type][key] = {
      marker: marker,
      infoWindow: infoWindow
    };

    // If the infoWindow is supplied, attach a click handler to the marker to
    // open the window.
    if (infoWindow) {
      marker.addListener("click", () => {
        this.activateMarker(type, key);
      });
    }

    return this.mapMarkers[type][key];

  }

  activateMarker(type, key) {
    let marker = this.mapMarkers[type][key].marker;
    let infoWindow = this.mapMarkers[type][key].infoWindow;

    // Set the pin to an active state
    marker.setIcon(pinActive);

    // Open the info window
    infoWindow.open(this.map, marker);

    // Clear all other active markers
    this.deactivateActiveMarker();

    // Add the marker reference object to the active marker property
    this.activeMarker = this.mapMarkers[type][key];

  }


  /**
   * [deactivateActiveMarker description]
   * @return {[type]} [description]
   */
  deactivateActiveMarker() {
    try {
      this.activeMarker.marker.setIcon(pin);
      this.activeMarker.infoWindow.close();
      return true;
    } catch (err) {
      return false;
    }
  }


  /**
   * Iterates through all the cities, adding a marker for each one to the map.
   * @return {Object} The references to the map markers added
   */
  placeCityMarkers() {

    // Place city markers
    this.props.cityData.forEach(city => {

      let marker = new window.google.maps.Marker({
        position: { lat: city.lat, lng: city.lng },
        map: this.map,
        title: city.name,
        icon: pin
      });

      let infoWindow = new window.google.maps.InfoWindow({
        content: '<div style="color:#333">hello world</div>'
      });

      // Reference the markers in the array by cityId
      this.addMarker('cities', city._id, marker, infoWindow);
    });

    // Return the references to the map markers
    return this.mapMarkers.cities;

  }



  render() {

    return (
      <Fragment>
        <section className="worldMap" id="worldMap"></section>
        <CityList
          markers={ this.mapMarkers.cities }
          activateMarker={ this.activateMarker } />
      </Fragment>
    );

  }
}

// Redux Store Data
const mapStateToProps = (state) => {
  return {
    cityData: state.cityData
  }
}

export default connect(
  mapStateToProps
)(WorldMap);
