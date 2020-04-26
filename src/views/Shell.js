import React, {Fragment} from 'react';

import Header from '../components/global/Header.js';

export default function Shell(props) {

    return (
      <Fragment>
        <Header />
        {props.children}
      </Fragment>
    );

}
