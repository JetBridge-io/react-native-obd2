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

import { CheckBox } from 'react-native-elements'
import SharedPreferences from 'react-native-sp';

const Color = require('../../utils/Color');

export default class CheckBoxPreference extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: false,
    }
  }

  componentDidMount() {
    SharedPreferences.getBoolean(this.props.prefKey)
    .then(result => this.setState({checked: result}));
  }

  checkBoxClicked() {
    let now = !this.state.checked;
    SharedPreferences.putBoolean(this.props.prefKey, now);
    this.setState({checked: now});
  }

  render() {
    let summary = this.state.checked ? this.props.summaryOn : this.props.summaryOff;

    return(
      <TouchableOpacity 
        onPress={this.checkBoxClicked.bind(this)}
        style={styles.container}
        >
        <View>
          <Text style={styles.title}>{this.props.title}</Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>
        <View style={{flex : 0.8}} />
        <CheckBox
          title=''
          iconRight
          containerStyle={{
            backgroundColor: 'transparent',
            borderWidth: 0}}
          onPress={this.checkBoxClicked.bind(this)}
          checked={this.state.checked} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    margin: 5,
    marginBottom: 2
  },
  title: {
    color: Color.BLACK,
    fontSize: 18
  },
  summary: {
    fontSize: 15
  }
});
