import React from 'react';

export default class CityListItem extends React.Component {

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    let cityId = e.target.dataset.cityId;
    this.props.activateMarker('cities', cityId);
  }

  render() {
    return (
      <li
        data-city-id={this.props.city._id}
        className={'flag-' + this.props.city.country.toLowerCase()}
        onClick={this.onClick}>
        {this.props.city.name}
      </li>
    );
  }
}
