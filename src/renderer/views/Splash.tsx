import React, { Component } from 'react';
const { ipcRenderer } = window.require('electron');

import SplashComponent from '../components/SplashComponent';

default class Splash extends Component {
  constructor(props) {
    super(props);
    this.state = { isLogged: null, isSplash: true };
  }

  componentDidMount() {
    var _that = this;
    ipcRenderer.on('get-user-log-status-resp', (evt, user) => {
      _that.setState({ isLogged: user, isSplash: false });
    });

    setTimeout(() => {
      ipcRenderer.send('get-user-log-status');
    }, 3000);
  }

  render() {
    return this.state.isSplash ? (
      <SplashComponent />
    ) : this.state.isLogged ? (
      <Redirect to="/splash" />
    ) : (
      <Redirect to="/login" />
    );
  }
}
