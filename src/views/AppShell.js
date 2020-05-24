import React, {Fragment} from 'react';

// General utility for setting up the app when users first visit the site
import AppSetup from '../controllers/global/AppSetup.js';

// UI Components
import Header from '../ui_components/global/Header.js';
import Footer from '../ui_components/global/Footer.js';

import '../styles/AppShell.css';

export default class AppShell extends React.Component {

  componentDidMount() {
    // Run setup tasks when component first mounts.
    const setup = new AppSetup();
    setup.removeOldPlayerIdAssociations();
  }

  render() {
    return (
      <Fragment>
        <Header />
        {this.props.children}
        <Footer />
      </Fragment>
    );
  }

}
