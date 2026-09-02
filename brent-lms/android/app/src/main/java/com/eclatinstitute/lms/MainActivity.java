package com.eclatinstitute.lms;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ScreenSecurityPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

@CapacitorPlugin(name = "ScreenSecurity")
class ScreenSecurityPlugin extends Plugin {
    @PluginMethod
    public void enable(PluginCall call) {
        if (getActivity() != null) {
            getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    getActivity().getWindow().setFlags(
                        WindowManager.LayoutParams.FLAG_SECURE,
                        WindowManager.LayoutParams.FLAG_SECURE
                    );
                    call.resolve();
                }
            });
        } else {
            call.resolve();
        }
    }

    @PluginMethod
    public void disable(PluginCall call) {
        if (getActivity() != null) {
            getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    getActivity().getWindow().clearFlags(
                        WindowManager.LayoutParams.FLAG_SECURE
                    );
                    call.resolve();
                }
            });
        } else {
            call.resolve();
        }
    }
}


