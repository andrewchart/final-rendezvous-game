import React from 'react';

import {connect} from 'react-redux';

// Styles
import '../../styles/WorldMap.css';

class WorldMap extends React.Component {

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

      var map = new window.google.maps.Map(document.getElementById('worldMap'), {
        center: {lat: 20, lng: 25},
        zoom: 3
      });

      // Place city markers
      this.props.cityData.forEach(city => {
        let marker = new window.google.maps.Marker({
          position: { lat: city.lat, lng: city.lng },
          map: map,
          title: city.name,

          // Add custom property to map marker object to be able to interact
          // with the marker later on.
          [process.env.REACT_APP_PREFIX + "cityId"]: city._id
        });
      });

    }
  }


  render() {

    return (
      <section className="worldMap" id="worldMap"></section>
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
