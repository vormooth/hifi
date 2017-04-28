package io.highfidelity.hifiinterface;


import com.google.vr.sdk.base.GvrActivity;
import com.google.vr.sdk.base.GvrView;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import com.google.vr.sdk.base.Viewport;
import javax.microedition.khronos.egl.EGLConfig;
import com.google.vr.sdk.base.Eye;
import com.google.vr.sdk.base.HeadTransform;
import android.widget.RelativeLayout;
import android.view.ViewGroup;
import com.google.vr.sdk.base.AndroidCompat;

public class GvrLoaderActivity extends GvrActivity implements GvrView.StereoRenderer {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.common_ui);
        GvrView view = (GvrView) findViewById(R.id.gvr_view);

        view.setEGLConfigChooser(8, 8, 8, 8, 16, 8);

        view.setRenderer(this);
        view.setTransitionViewEnabled(true);

        // Enable Cardboard-trigger feedback with Daydream headsets. This is a simple way of supporting
        // Daydream controller input for basic interactions using the existing Cardboard trigger API.
        view.enableCardboardTriggerEmulation();

        setGvrView(view);

        view.setOnCardboardTriggerListener(new Runnable() {
            public void run() {
                GvrLoaderActivity.this.finish();
                Intent i = new Intent(GvrLoaderActivity.this, InterfaceActivity.class);
                GvrLoaderActivity.this.startActivity(i);
                GvrLoaderActivity.this.finish();
            }

        });
    }

    @Override
    public void onRendererShutdown() {
    }
    @Override
    public void onNewFrame(HeadTransform headTransform) {
    }

    @Override
    public void onPause() {
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
    }
    @Override
    public void onFinishFrame(Viewport viewport) {
    }

    @Override
    public void onCardboardTrigger() {
        this.finish();
        Intent i = new Intent(GvrLoaderActivity.this, InterfaceActivity.class);
        this.startActivity(i);
        this.finish();
    }

    @Override
    public void onSurfaceChanged(int width, int height) {
    }

    @Override
    public void onDrawEye(Eye eye) {
    }

    @Override
    public void onSurfaceCreated(EGLConfig config) {
    }
}