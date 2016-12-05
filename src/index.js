import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {Login, Join, Questions} from './App';
import {Router, Route, IndexRoute, hashHistory} from 'react-router';
import firebase from 'firebase';
import PollResult from './PollResults';


// Initialize Firebase
var config = {
  apiKey: "AIzaSyANt5bDNQuPXPQWuorCG3UhHHB0JMCVZyY",
  authDomain: "mana-poll.firebaseapp.com",
  databaseURL: "https://mana-poll.firebaseio.com",
  storageBucket: "mana-poll.appspot.com",
  messagingSenderId: "816868124241"
};
firebase.initializeApp(config);

//load CSS
import 'bootstrap/dist/css/bootstrap.css';
//import './css/index.css';

ReactDOM.render(
  <Router history={hashHistory}> 
    <Route path="/" component={App}>
      <IndexRoute component={Questions} />
      <Route path="join" component={Join} />
      <Route path="login" component={Login} />
      <Route path="questions" component={Questions} />
      <Route path="results" component={PollResult} />
    </ Route>
  </ Router>
  ,
  document.getElementById('root')
);

//extraneous method call to produce error for non-configured app
firebase.auth(); 