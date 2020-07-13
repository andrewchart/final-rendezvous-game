import React from 'react';

import {connect} from 'react-redux';

import CityListItem from './CityListItem.js';

class CityList extends React.Component {

  render() {
    return (
      <section className="cityList">
        <h4>City List</h4>
        <ul>
          {
            this.props.cityData.map(city => {
              return (
                <CityListItem
                  city={city}
                  key={city._id} />
              );
            })
          }
        </ul>
      </section>
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
)(CityList);
