import React, {Suspense, lazy} from 'react';
import ReactDOM from 'react-dom';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

// Global Styles
import './styles/global.css';

// Components
import Loading from './components/global/Loading.js';
import ErrorBoundary from './components/global/ErrorBoundary.js';

// App Shell
import Shell from './views/Shell.js';

// Views
import Home from './views/Home.js';
import Error from './views/Error.js';
const  Play = lazy(() => import('./views/Play.js'));

//import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Shell>
            <Switch>

              <Route path="/play">
                <Play />
              </Route>

              <Route exact path="/">
                <Home />
              </Route>

              <Route
                path="*"
                component={() => <Error type="404" />} />

            </Switch>
          </Shell>
        </Suspense>
      </ErrorBoundary>
    </Router>
  </React.StrictMode>,
  document.getElementById('app')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
