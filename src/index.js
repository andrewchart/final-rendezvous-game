import React, {Suspense, lazy} from 'react';
import ReactDOM from 'react-dom';

// Router
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

// Components
import ErrorBoundary from './ui_components/global/ErrorBoundary.js';
import Loading from './ui_components/global/Loading.js';

// Views
import AppShell from './views/AppShell.js';
import Error from './views/Error.js';
const  GameShell = lazy(() => import('./views/GameShell.js'));
const  Home = lazy(() => import('./views/Home.js'));

//import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <AppShell>
            <Switch>

              <Route path="/game/:gameId?" component={GameShell} />

              <Route path="/about">
                <main>About</main>
              </Route>

              <Route path="/how-to-play">
                <main>How To Play</main>
              </Route>

              <Route exact path="/">
                <Home />
              </Route>

              { /* Todo: server respond 404 */ }
              <Route
                path="*"
                component={() => <Error type="404" />} />

            </Switch>
          </AppShell>
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
