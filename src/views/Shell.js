import React, {Fragment} from 'react';

import Header from '../ui_components/global/Header.js';
import Footer from '../ui_components/global/Footer.js';

import '../styles/shell.css';

export default function Shell(props) {

    return (
      <Fragment>
        <Header />
        {props.children}
        <Footer />
      </Fragment>
    );

}
