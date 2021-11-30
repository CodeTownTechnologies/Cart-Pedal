package in.cartpedal;

import android.content.Context;
import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class BridgeModule extends ReactContextBaseJavaModule {
    public static int duration;

    public BridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BridgeModule";
    }

    @ReactMethod
    public void showFullscreen(String videoUri, int duraitonToSeek) {
        duration = duraitonToSeek;
        Context context = getReactApplicationContext();
        Intent intent = new Intent(context, VideoActivity.class);
        intent.putExtra("VIDEO_URL", videoUri);
        getCurrentActivity().startActivity(intent);
    }
}