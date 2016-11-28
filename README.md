#react-native-obd2
React-native OBD-II reader designed to connect with Bluetooth Elm327 OBD reader. This project is inspired from [android-obd-reader]( https://github.com/pires/android-obd-reader) so that we wrapped the OBD Java API in order to use in react-native world.

#How to install
Run below link on your project root folder.
````
$ npm install react-native-obd2 --save
$ react-native link
````

#APIs
## ready()
This method will check a bluetooth status and prepare to use it.
````
const obd2 = require('react-native-obd2');
...
obd2.ready();
````

## getBluetoothDeviceNameList
This method brings available bluetooth device information including name and address. The result is array type of maps which consist of "name" and "address".
### Example
````
const obd2 = require('react-native-obd2');
...
obd2.getBluetoothDeviceNameList()
     .then((nameList) => console.log('Bluetooth device list : ' + JSON.stringify(nameList)))
      .catch((e) => console.log('Get device name error : ' + e)));
````

### Output
````
Bluetooth device list: [{name: "OBD-II", address: "10 F0 8B 3F 91"}]
````

## setMockUpMode(enabled)
react-native-obd2 provides mock up mode so that you can simply check your apps without connecting real bluetooth device as android-obd-reader did. Default value is 'false'. Therefore, react-native-obd2 will work in real mode if you do not use this method.

## startLiveData(btDeviceAddress)
Do work! do!
The data is flow to your listeners. Therfore you have to set your listenr named 'obd2LiveData'.

### Example
````
const obd2 = require('react-native-obd2');
...
  componentDidMount() {
    this.obdLiveDataListener = DeviceEventEmitter.addListener('obd2LiveData', this.obdLiveData);
    obd2.startLiveData('10 F0 8B 3F 91');
  }

  componentWillUnmount() {
    this.obdStatusListener.remove();
  }
````

## stopLiveData()
Hey stop it!

## Listeners
### 'obd2bluetoothStatus' 
for getting bluetooth device status.

JSON key | Type | Description
---------|------|----------------
status   |String|'connected' or 'disconnected' or 'error' or 'disable' or 'ready' or 'connecting'

### 'obd2Status'
for getting OBD-II device status

JSON key | Type | Description
---------|------|----------------
status   |String|'disconnected' or 'receiving' or OBD data result

### 'obd2LiveData'
for getting OBD-II data. Data structure is a dictionary as below.

````
{
   'cmdID' : String,
   'cmdName' : String,
   'cmdResult' : String
}
````

## Example
We also provide simple working example in Example folder. We hope it would be helpful for you.

## License
The MIT License (MIT)

Copyright (c) 2016-present JetBridge, LLC.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
