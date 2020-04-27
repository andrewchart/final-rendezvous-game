import React, {Fragment} from 'react';

import Header from '../components/global/Header.js';
import Footer from '../components/global/Footer.js';

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
