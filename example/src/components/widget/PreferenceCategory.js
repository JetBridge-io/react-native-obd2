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
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackAndroid,
  Dimensions,
  DeviceEventEmitter,
  ScrollView
} from 'react-native';

const Color = require('../../utils/Color');

export default class PreferenceCategory extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Text style={[this.props.style], {color:Color.SETTING_TITLE, fontSize: 14, fontWeight: 'bold'}}>{this.props.text}</Text>
    );
  }
}
