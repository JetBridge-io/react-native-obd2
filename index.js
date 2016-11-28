/**
 * Copyright (c) 2016-present JetBridge, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const jetbridge_obd2 = require('react-native').NativeModules.JetBridge_OBDII;

class react_obd2 {
  constructor() {
  }

  ready() {
    jetbridge_obd2.ready();
  }

  getBluetoothDeviceNameList() {
    return jetbridge_obd2.getBluetoothDeviceName();
  }

  setMockUpMode(aEnabled) {
    jetbridge_obd2.setMockUpMode(aEnabled);
  }

  startLiveData(aDeviceAddress) {
    jetbridge_obd2.setRemoteDeviceAddress(aDeviceAddress);
    jetbridge_obd2.startLiveData();
  }

  stopLiveData() {
    return jetbridge_obd2.stopLiveData();
  }
}

module.exports = new react_obd2();
