/**
 * Copyright (c) 2016-present JetBridge, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import React, { 
  Component,
  PropTypes
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackAndroid,
  Dimensions,
  ScrollView
} from 'react-native';

import SharedPreferences from 'react-native-sp';

const DialogAndroid = require('react-native-dialogs');
const Color = require('../../utils/Color');

export default class ListPreference extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected : ''
    }
  }

  openDialog() {
    let options = {
      title: this.props.dialogTitle,
      negativeText: 'Cancel',
      items : this.props.items,
      selectedIndex : this.props.selectedIndex,
      itemsCallbackSingleChoice: (id, text) => {
        console.log(id + ': ' + text);
        this.props.onSelected && this.props.onSelected(id);
      }
    };

    let dialog = new DialogAndroid();
    dialog.set(options);
    dialog.show();
  }

  componentDidMount() {
    SharedPreferences.getString(this.props.prefKey)
    .then(result => this.setState({selected: result}));
  }

  render() {
    let summary = this.state.checked ? this.props.summaryOn : this.props.summaryOff;

    return(
      <View>
        <TouchableOpacity 
          onPress={this.openDialog.bind(this)}
          style={styles.container}
          >
          <View>
            <Text style={styles.title}>{this.props.title}</Text>
            <Text style={styles.summary}>{this.props.summary}</Text>
          </View>
        </TouchableOpacity>
      </View>
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

