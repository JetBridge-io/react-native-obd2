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
import { List } from 'react-native-elements';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
import NavigationBar from 'react-native-navbar';
import SharedPreference from 'react-native-sp';

import AppEventEmitter from '../services/AppEventEmitter';

const obd2 = require('react-native-obd2');
const SensorManager = require('NativeModules').SensorManager;

const Color = require('../utils/Color');
const Constant = require('../utils/Constant');

export default class OBDReader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      direction: '-',
      speed: '0km/h',
      rpm: '0RPM',
      engineRunTime: '00:00:00',
      isStartLiveData: false,
      gpsState: '-',
      btStatus : '-',
      btDeviceList: [],
      btSelectedDeviceAddress: '',
      obdStatus: 'disconnected',
      debug : '-',
      obd2Data : { } 
    };

    this.sensorOrientation = this.sensorOrientation.bind(this);
    this.btStatus = this.btStatus.bind(this);
    this.obdStatus = this.obdStatus.bind(this);
    this.obdLiveData = this.obdLiveData.bind(this);
  }

  btStatus(data) {
    this.setState({btStatus : data.status});
  }

  obdStatus(data) {
    this.setState({obdStatus : data.status});
  }

  obdLiveData(data) {
    let copyData = JSON.parse(JSON.stringify(this.state.obd2Data));
    copyData[data.cmdID] = data;
    this.setState({
      obd2Data : copyData,
    });

    if (data.cmdID === 'ENGINE_RPM') {
      this.setState({
        rpm : data.cmdResult,
      });
    }

    if (data.cmdID === 'SPEED') {
      this.setState({
        speed: data.cmdResult,
      });
    }
  }

  sensorOrientation(data) {
//    this.setState({debug: 'Orientation data = ' + JSON.stringify(data)});
    if (data.azimuth >= 337.5 || data.azimuth < 22.5) {
      if (this.state.direction !== 'N') {
        this.setState({direction: 'N'});
      }
    } else if (data.azimuth >= 22.5 && data.azimuth < 67.5) {
      if (this.state.direction !== 'NE') {
        this.setState({direction: 'NE'});
      }
    } else if (data.azimuth >= 67.5 && data.azimuth < 112.5) {
      if (this.state.direction !== 'E') {
        this.setState({direction: 'E'});
      }
    } else if (data.azimuth >= 112.5 && data.azimuth < 157.5) {
      if (this.state.direction !== 'SE') {
        this.setState({direction: 'SE'});
      }
    } else if (data.azimuth >= 157.5 && data.azimuth < 202.5) {
      if (this.state.direction !== 'S') {
        this.setState({direction: 'S'});
      }
    } else if (data.azimuth >= 202.5 && data.azimuth < 247.5) {
      if (this.state.direction !== 'SW') {
        this.setState({direction: 'SW'});
      }
    } else if (data.azimuth >= 247.5 && data.azimuth < 292.5) {
      if (this.state.direction !== 'W') {
        this.setState({direction: 'W'});
      }
    } else if (data.azimuth >= 292.5 && data.azimuth < 337.5) {
      if (this.state.direction !== 'NW') {
        this.setState({direction: 'NW'});
      }
    }
  }

  componentDidMount() {
    this.btStatusListener = DeviceEventEmitter.addListener('obd2BluetoothStatus', this.btStatus);
    this.obdStatusListener = DeviceEventEmitter.addListener('obd2Status', this.obdStatus);
    this.obdLiveDataListener = DeviceEventEmitter.addListener('obd2LiveData', this.obdLiveData);
    this.setDeviceAddressListener = AppEventEmitter.addListener('OBDReader.setDeviceAddress', this.setDeviceAddress.bind(this));

    this.onReady();
  }

  componentWillUnmount() {
    this.stopLiveData();
    this.btStatusListener.remove();
    this.obdStatusListener.remove();
  }

  onReady() {
    obd2.ready();
  }

  startLiveData() {
    SharedPreference.getBoolean(Constant.KEY_ENABLE_MOCKUP)
      .then((isMockUpMode) => {
        if (!isMockUpMode && this.state.btSelectedDeviceAddress.length === 0) {
          Alert.alert(
            'Bluetooth Device',
            'You have to enable Bluetooth and select bluetooth device in Setting menu',
            [
              {text: 'OK', onPress: () => {}},
            ]
          )
          return;
        }

        this.setState({
          isStartLiveData: true,
        });
        
        SensorManager.startOrientation(1000);
        this.listenerOrientation = DeviceEventEmitter.addListener('Orientation', this.sensorOrientation);
        obd2.setMockUpMode(isMockUpMode);
        obd2.startLiveData(this.state.btSelectedDeviceAddress);
      });
  }

  stopLiveData() {
    this.setState({
      isStartLiveData: false,
      direction: '-',
      bluetoothStatus: '-',
    });
    SensorManager.stopOrientation();
    this.obdLiveDataListener && this.obdLiveDataListener.remove();
    this.listenerOrientation && this.listenerOrientation.remove();
    obd2.stopLiveData();
  }

  getDTC() {
  }

  getTrips() {
  }

  setDeviceAddress(aDeviceAddress) {
    console.log('setDeviceAddress : ' + aDeviceAddress);
    this.setState({btSelectedDeviceAddress : aDeviceAddress});
  }

  openSettings() {
    Actions.Settings({
      btSelectedDeviceAddress : this.state.btSelectedDeviceAddress,
    });

    /*
    obd2.getBluetoothDeviceNameList()
      .then((nameList) => {
        console.log('Bluetooth device list : ' + JSON.stringify(nameList));
        this.setState({btDeviceList : nameList});
    
      })
      .catch((e) => {
        console.log('Get device name error : ' + e)
        Actions.Settings({
          btSelectedDeviceAddress : '',
          btDeviceList : []
        });
      });
*/
  }

  runMenu(value) {
    switch(value) {
      case 1 : 
        this.startLiveData();
        break;
      case 2 :
        this.stopLiveData();
        break;
      case 3 :
        this.openSettings();
        break;
      default :
        break;
    }
  }

  render() {
    let startLiveColor = this.state.isStartLiveData ? Color.DISABLED_COLOR : Color.BLACK;
    let stopLiveColor = this.state.isStartLiveData ? Color.BLACK : Color.DISABLED_COLOR;

    let originData = this.state.obd2Data;
    let cmdKeys = Object.keys(this.state.obd2Data);
    let cmdData = cmdKeys.map(function(key) { return originData[key]; });

    return (
      <MenuContext style={{flex: 1}}>
      <View style={{flex: 1}}> 
        <NavigationBar
          style={{flex: 0.1, backgroundColor: Color.BG_NAVIBAR}}
          tintColor={Color.WHITE}
          title={{title: 'OBD-II Reader', tintColor:Color.WHITE}}
          rightButton={
            <Menu onSelect={this.runMenu.bind(this)}>
              <MenuTrigger>
                <Text style={{
                  marginRight: 10, 
                  padding: 10, 
                  alignSelf: 'center', 
                  fontSize: 20, 
                  color: Color.WHITE}}>&#8942;</Text>
              </MenuTrigger>
              <MenuOptions>
                <MenuOption disabled={this.state.isStartLiveData} value={1}>
                  <Text style={[styles.menuOptionText, {color: startLiveColor}]} >Start Live Data</Text>
                </MenuOption>
                <MenuOption disabled={!this.state.isStartLiveData} value={2}>
                  <Text style={[styles.menuOptionText, {color: stopLiveColor}]}>Stop Live Data</Text>
                </MenuOption>
                <MenuOption value={3}>
                  <Text style={styles.menuOptionText}>Settings</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          }
        />
        <View style={styles.bodyContainer}>
          <View style={{flex: .1, flexDirection:'row'}}>
            <Text style={{fontSize:30}}>{this.state.speed}</Text>
            <View style={{flex: 0.8}}/>
            <Text style={{fontSize:30}}>{this.state.direction}</Text>
          </View>
          <View style={{flex: .05, flexDirection:'row', justifyContent: 'space-around'}}>
            <Text style={{fontSize:15}}>{this.state.speed}</Text>
            <Text style={{fontSize:15}}>{this.state.engineRunTime}</Text>
            <Text style={{fontSize:15}}>{this.state.rpm}</Text>
          </View>
          <View style={{flex: .6, borderWidth:1}}>
            <ScrollView>
              {
                cmdData.map((item, index) => (
                  <View 
                    style={{flexDirection:'row', alignItems: 'center'}}
                    key={index}
                    >
                    <Text style={{flex: .6, textAlign:'right'}}>{item.cmdName}</Text>
                    <Text style={{flex: .4}}>: {item.cmdResult}</Text>
                  </View>
                ))
              }
            </ScrollView>
          </View>
          <View style={{flex: .1, flexDirection:'row', justifyContent: 'space-around'}}>
            <View>
              <Text style={{fontSize:18}}>GPS</Text>
              <Text style={{fontSize:15, textAlign: 'center'}}>{this.state.gpsState}</Text>
            </View>
            <View>
              <Text style={{fontSize:18}}>Bluetooth</Text>
              <Text style={{fontSize:15, textAlign: 'center'}}>{this.state.btStatus}</Text>
            </View>
            <View>
              <Text style={{fontSize:18}}>OBD</Text>
              <Text style={{fontSize:15, textAlign: 'center'}}>{this.state.obdStatus}</Text>
            </View>
          </View>
        </View>
      </View>
     </MenuContext>
    );
  }
}

const styles = StyleSheet.create({
  bodyContainer: {
    padding: 5,
    flex: .9
  },
  menuOptionText: {
    fontSize: 18,
    padding: 5,
    color: Color.BLACK
  }
});

