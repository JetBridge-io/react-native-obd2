/*
 * Copyright (c) 2016-present JetBridge LLC
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

package com.jetbridge.reactobd2;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Handler;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.github.pires.obd.commands.ObdCommand;
import com.github.pires.obd.enums.AvailableCommandNames;
import com.github.pires.obd.reader.config.ObdConfig;
import com.github.pires.obd.reader.io.AbstractGatewayService;
import com.github.pires.obd.reader.io.MockObdGatewayService;
import com.github.pires.obd.reader.io.ObdCommandJob;
import com.github.pires.obd.reader.io.ObdGatewayService;
import com.github.pires.obd.reader.io.ObdProgressListener;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class OBD2Handler implements ObdProgressListener {
  private static final String TAG = "OBD2Handler";

  private static final String EVENTNAME_OBD2_DATA = "obd2LiveData";
  private static final String EVENTNAME_BT_STATUS = "obd2BluetoothStatus";
  private static final String EVENTNAME_OBD_STATUS = "obd2Status";

  private ReactContext mReactContext = null;
  private ObdProgressListener mObdProgressListener = null;
  private Arguments mArguments;

  private boolean mPreRequisites = true;
  private String mRemoteDeviceName = "";
  private boolean mMockUpMode = false;

  private boolean mIsServiceBound;
  private AbstractGatewayService service;
  private final Runnable mQueueCommands = new Runnable() {
    public void run() {
      if (service != null && service.isRunning() && service.queueEmpty()) {
        queueCommands();
      }
      // run again in period defined in preferences
      new Handler().postDelayed(mQueueCommands, 400);
    }
  };

  private ServiceConnection serviceConn = new ServiceConnection() {
    @Override
    public void onServiceConnected(ComponentName className, IBinder binder) {
      Log.d(TAG, className.toString() + " service is bound");
      mIsServiceBound = true;
      service = ((AbstractGatewayService.AbstractGatewayServiceBinder) binder).getService();
      service.setContext(mReactContext);
      service.setOBDProgressListener(mObdProgressListener);
      Log.d(TAG, "Starting live data");
      try {
        service.startService(mRemoteDeviceName);
        if (mPreRequisites) {
          sendDeviceStatus(EVENTNAME_BT_STATUS, "connected");
        }
      } catch (IOException ioe) {
        Log.e(TAG, "Failure Starting live data");
        sendDeviceStatus(EVENTNAME_BT_STATUS, "error");
        doUnbindService();
      }
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
      return super.clone();
    }

    // This method is *only* called when the connection to the service is lost unexpectedly
    // and *not* when the client unbinds (http://developer.android.com/guide/components/bound-services.html)
    // So the isServiceBound attribute should also be set to false when we unbind from the service.
    @Override
    public void onServiceDisconnected(ComponentName className) {
      Log.d(TAG, className.toString() + " service is unbound");
      mIsServiceBound = false;
    }
  };

  OBD2Handler(ReactContext aContext) {
    mReactContext = aContext;
    mObdProgressListener = this;
  }

  public void ready() {

    // onStart
    final BluetoothAdapter btAdapter = BluetoothAdapter.getDefaultAdapter();

    // onResume
    // get Bluetooth device
    mPreRequisites = btAdapter != null && btAdapter.isEnabled();
    if (!mPreRequisites) {
      mPreRequisites = btAdapter != null && btAdapter.enable();
    }

    if (!mPreRequisites) {
      sendDeviceStatus(EVENTNAME_BT_STATUS, "disabled");
    } else {
      sendDeviceStatus(EVENTNAME_BT_STATUS, "ready");
    }

    sendDeviceStatus(EVENTNAME_OBD_STATUS, "disconnected");
  }

  public void startLiveData() {
    doBindService();

    // start command execution
    new Handler().post(mQueueCommands);
  }

  public void stopLiveData() {
    Log.d(TAG, "Stopping live data..");
    doUnbindService();
  }

  public void setRemoteDeviceName(String aRemoteDeviceName) {
    mRemoteDeviceName = aRemoteDeviceName;
  }

  public void setMockUpMode(boolean enabled) {
    mMockUpMode = enabled;
  }

  private void sendEvent(String eventName, @Nullable WritableMap params)
  {
    try {
      mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    } catch (RuntimeException e) {
      Log.e("OBD2Handler", "Error to send an event to jsModule");
    }
  }

  private void queueCommands() {
    if (mIsServiceBound) {
      for (ObdCommand Command : ObdConfig.getCommands()) {
        service.queueJob(new ObdCommandJob(Command));
      }
    }
  }

  private void doBindService() {
    if (!mIsServiceBound) {
      Log.d(TAG, "Binding OBD service..");
      if (mPreRequisites && !mMockUpMode) {
        sendDeviceStatus(EVENTNAME_BT_STATUS, "connecting");
        Intent serviceIntent = new Intent(mReactContext, ObdGatewayService.class);
        mReactContext.bindService(serviceIntent, serviceConn, Context.BIND_AUTO_CREATE);
      } else {
        sendDeviceStatus(EVENTNAME_BT_STATUS, "disabled");
        Intent serviceIntent = new Intent(mReactContext, MockObdGatewayService.class);
        mReactContext.bindService(serviceIntent, serviceConn, Context.BIND_AUTO_CREATE);
      }
    }
  }

  private void doUnbindService() {
    if (mIsServiceBound) {
      if (service.isRunning()) {
        service.stopService();
        if (mPreRequisites) {
          sendDeviceStatus(EVENTNAME_BT_STATUS, "ready");
        }
      }

      Log.d(TAG, "Unbinding OBD service..");
      mReactContext.unbindService(serviceConn);
      mIsServiceBound = false;
      sendDeviceStatus(EVENTNAME_OBD_STATUS, "disconnected");
    }
  }

  public static String LookUpCommand(String txt) {
    for (AvailableCommandNames item : AvailableCommandNames.values()) {
      if (item.getValue().equals(txt)) return item.name();
    }
    return txt;
  }

  public Set<BluetoothDevice> getBondedDevices() throws IOException {
    if (!mPreRequisites) {
      throw new IOException("Bluetooth is not enabled");
    }

    final BluetoothAdapter btAdapter = BluetoothAdapter.getDefaultAdapter();
    if (btAdapter == null || !btAdapter.isEnabled()) {
      throw new IOException("This device does not support Bluetooth or it is disabled.");
    }

    Set<BluetoothDevice> pairedDevices = btAdapter.getBondedDevices();
    return pairedDevices;
  }

  @Override
  public void stateUpdate(ObdCommandJob job) {
    final String cmdName = job.getCommand().getName();
    String cmdResult = "";
    final String cmdID = LookUpCommand(cmdName);

    if (job.getState().equals(ObdCommandJob.ObdCommandJobState.EXECUTION_ERROR)) {
      cmdResult = job.getCommand().getResult();
      if (cmdResult != null && mIsServiceBound) {
        sendDeviceStatus(EVENTNAME_OBD_STATUS, cmdResult.toLowerCase());
      }
    } else if (job.getState().equals(ObdCommandJob.ObdCommandJobState.BROKEN_PIPE)) {
      if (mIsServiceBound) {
        stopLiveData();
      }
    } else if (job.getState().equals(ObdCommandJob.ObdCommandJobState.NOT_SUPPORTED)) {
      cmdResult = "N/A";
    } else {
      cmdResult = job.getCommand().getFormattedResult();
      if(mIsServiceBound) {
        sendDeviceStatus(EVENTNAME_OBD_STATUS, "receiving");
      }
    }

    /*
    if (vv.findViewWithTag(cmdID) != null) {
      existingTV.setText(cmdResult);
    } else addTableRow(cmdID, cmdName, cmdResult);
    */

    // In order to upload data to a server.
    // commandResult.put(cmdID, cmdResult);
    WritableMap map = mArguments.createMap();
    map.putString("cmdID", cmdID);
    map.putString("cmdName", cmdName);
    map.putString("cmdResult", cmdResult);
    sendEvent(EVENTNAME_OBD2_DATA, map);
  }

  private void sendDeviceStatus(String eventName, String status) {
    WritableMap btMap = mArguments.createMap();
    btMap.putString("status", status);
    sendEvent(eventName, btMap);
  }
}
