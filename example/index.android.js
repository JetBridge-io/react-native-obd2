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
} from 'react-native';

import RootRouter from './src/components/RootRouter';

class reactobd2 extends Component {
  render() {
    return (
        <RootRouter />
    );
  }
}

AppRegistry.registerComponent('obd2example', () => reactobd2);
