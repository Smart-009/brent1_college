package com.eclatinstitute.lms;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.addJavascriptInterface(new SecurityBridge(), "AndroidSecurity");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public class SecurityBridge {
        @JavascriptInterface
        public void enableProtection() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    getWindow().setFlags(
                        WindowManager.LayoutParams.FLAG_SECURE,
                        WindowManager.LayoutParams.FLAG_SECURE
                    );
                }
            });
        }

        @JavascriptInterface
        public void disableProtection() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    getWindow().clearFlags(
                        WindowManager.LayoutParams.FLAG_SECURE
                    );
                }
            });
        }
    }
}



