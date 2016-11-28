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
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  View,
  Alert,
  AppState,
  TouchableOpacity,
  BackAndroid,
  Dimensions,
  DeviceEventEmitter,
  ScrollView
} from 'react-native';


import { Actions } from 'react-native-router-flux';
import NavigationBar from 'react-native-navbar';
import AppEventEmitter from '../services/AppEventEmitter';

import Category from './widget/PreferenceCategory';
import CheckBoxPreference from './widget/CheckBoxPreference';
import ListPreference from './widget/ListPreference';

const obd2 = require('react-native-obd2');
const Color = require('../utils/Color');
const Constant = require('../utils/Constant');

export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedBTDeviceIndex: 0,
      btDeviceListForUI: [],
      btDeviceList: [],
      debug : '-',
    };
  }

  componentDidMount() {
    // set selectedBTDeviceIndex
    let pairedList = [];
    let selected = 0;

    obd2.getBluetoothDeviceNameList()
      .then((nameList) => {
        console.log('Bluetooth device list : ' + JSON.stringify(nameList));
        this.setState({btDeviceList : nameList});
        let deviceForUI = nameList.map((item, index) => {
          if (item.address === this.props.btSelectedDeviceAddress) {
            this.setState({selectedBTDeviceIndex : index});
          }
          return item.name + '\n' + item.address;
        });
        this.setState({btDeviceListForUI : deviceForUI});
      })
      .catch((e) => {
        console.log('Get device name error : ' + e)
        Actions.Settings({
          btDeviceList : []
        });
      });
  }

  render() {
    return(
      <View> 
        <NavigationBar
          style={{flex: 0.1, backgroundColor: Color.BG_NAVIBAR}}
          tintColor={Color.WHITE}
          title={{title: 'OBD-II Reader', tintColor:Color.WHITE}}
        />
        <ScrollView>
          <View style={styles.rowContainer}>
            <Category text='Bluetooth'/>
            <CheckBoxPreference
              title='Enable Mock up mode'
              summaryOff='Disable Mockup mode'
              summaryOn='Enable Mockup mode'
              prefKey={Constant.KEY_ENABLE_MOCKUP} />
          </View>
          <View style={styles.rowContainer}>
            <ListPreference
              title='Bluetooth Devices'
              dialogTitle='Bluetooth device list'
              items={this.state.btDeviceListForUI}
              selectedIndex={this.state.selectedBTDeviceIndex}
              onSelected={(index) => 
                {
                  this.setState({
                    selectedBTDeviceIndex : index
                  });
                  console.log('Selected : ' + index);
                  AppEventEmitter.emit('OBDReader.setDeviceAddress', this.state.btDeviceList[index].address);
                }
              }
              summary='List of paired bluetooth devices.'
              prefKey={Constant.KEY_BT_LIST} />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowContainer: {
    padding: 10,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderColor: Color.SETTING_BORDER_COLOR
  },
});
 
