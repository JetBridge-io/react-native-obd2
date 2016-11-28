/**
 * Copyright (c) 2016-present JetBridge, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import React, { Component } from 'react';

import {
  PropTypes,
  StyleSheet,
  Text,
  View,
  PixelRatio,
  DeviceEventEmitter,
  AppState
} from 'react-native'

import {
  Scene, 
  Reducer, 
  Router, 
  Switch, 
  TabBar, 
  Modal, 
  Schema, 
  Actions, 
} from 'react-native-router-flux'

import SharedPreference from 'react-native-sp';
import OBDReader from './OBDReader';
import Settings from './Settings';

import AppEventEmitter from '../services/AppEventEmitter';

const PreferenceDefaultValue = {
  enable_bluetooth_preference: false,
  enable_mockup_preference: false,
};

export default class RootRouter extends Component {
  constructor(props) {
    super(props);
    SharedPreference.init(PreferenceDefaultValue);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene key="OBDReader" component={OBDReader} title="OBDReader" hideNavBar={true} initial={true} />
          <Scene key="Settings" component={Settings} title="Settings" hideNavBar={true} />
        </Scene>
      </Router>
    )
  }
}
