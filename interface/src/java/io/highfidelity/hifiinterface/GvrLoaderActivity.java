package io.highfidelity.hifiinterface;


import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.opengl.GLES20;
import android.opengl.GLUtils;
import android.opengl.Matrix;
import android.os.Bundle;

import com.google.vr.sdk.base.Eye;
import com.google.vr.sdk.base.GvrActivity;
import com.google.vr.sdk.base.GvrView;
import com.google.vr.sdk.base.HeadTransform;
import com.google.vr.sdk.base.Viewport;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;

import javax.microedition.khronos.egl.EGLConfig;

/**
 * Created by jstuartmilne on 5/1/17.
 */

public class GvrLoaderActivity extends GvrActivity implements GvrView.StereoRenderer {

    private FloatBuffer cubeVertices;
    private FloatBuffer mCubeTextureCoordinates;


    private int cubeProgram;

    private int cubePositionParam;
    private int cubeModelParam;
    private int cubeModelViewParam;
    private int cubeModelViewProjectionParam;

    private float[] camera;
    private float[] view;
    private float[] headView;
    private float[] modelViewProjection;
    private float[] modelView;


    private static final float Z_NEAR = 1.0f;
    private static final float Z_FAR = 100.0f;

    private static final float MAX_MODEL_DISTANCE = 3.0f;
    private static final int COORDS_PER_VERTEX = 3;

    protected float[] modelCube;
    protected float[] modelPosition;
    private float[] headRotation;




    /** This will be used to pass in the texture. */
    private int mTextureUniformHandle;

    /** This will be used to pass in model texture coordinate information. */
    private int mTextureCoordinateHandle;

    /** Size of the texture coordinate data in elements. */
    private final int mTextureCoordinateDataSize = 2;

    private static final float CAMERA_Z = 0.01f;

    private final int mBytesPerFloat = 4;

    final int[] textureHandle = new int[1];


    @Override
    protected void onCreate(Bundle savedInstanceState) {

        modelCube = new float[16];
        camera = new float[16];
        view = new float[16];
        modelViewProjection = new float[16];
        modelView = new float[16];
        // Model first appears directly in front of user.
        modelPosition = new float[] {0.0f, 0.0f, -MAX_MODEL_DISTANCE / 2.0f};
        headRotation = new float[4];
        headView = new float[16];

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

    /**
     * Prepares OpenGL ES before we draw a frame.
     *
     * @param headTransform The head transformation in the new frame.
     */
    @Override
    public void onNewFrame(HeadTransform headTransform) {
        // Build the camera matrix and apply it to the ModelView.
        Matrix.setLookAtM(camera, 0, 0.0f, 0.0f, CAMERA_Z, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f, 0.0f);
        headTransform.getHeadView(headView, 0);
        // Update the 3d audio engine with the most recent head rotation.
        headTransform.getQuaternion(headRotation, 0);
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
        GLES20.glEnable(GLES20.GL_DEPTH_TEST);
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT | GLES20.GL_DEPTH_BUFFER_BIT);


        // Apply the eye transformation to the camera.
        Matrix.multiplyMM(view, 0, eye.getEyeView(), 0, camera, 0);


        // Build the ModelView and ModelViewProjection matrices
        // for calculating cube position and light.
        float[] perspective = eye.getPerspective(Z_NEAR, Z_FAR);
        Matrix.multiplyMM(modelView, 0, view, 0, modelCube, 0);
        Matrix.multiplyMM(modelViewProjection, 0, perspective, 0, modelView, 0);

        GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D,  textureHandle[0]);

        GLES20.glUniform1i(mTextureUniformHandle, 0);

        drawCube();
    }
    public void drawCube() {
        GLES20.glUseProgram(cubeProgram);

        // Set the Model in the shader, used to calculate lighting
        GLES20.glUniformMatrix4fv(cubeModelParam, 1, false, modelCube, 0);
        // Set the ModelView in the shader, used to calculate lighting
        GLES20.glUniformMatrix4fv(cubeModelViewParam, 1, false, modelView, 0);
        // Set the position of the cube
        GLES20.glVertexAttribPointer(
            cubePositionParam, COORDS_PER_VERTEX, GLES20.GL_FLOAT, false, 0, cubeVertices);
        // Set the ModelViewProjection matrix in the shader.
        GLES20.glUniformMatrix4fv(cubeModelViewProjectionParam, 1, false, modelViewProjection, 0);
        // Set the normal positions of the cube, again for shading


        mCubeTextureCoordinates.position(0);
        GLES20.glVertexAttribPointer(mTextureCoordinateHandle, mTextureCoordinateDataSize, GLES20.GL_FLOAT, false,
            0, mCubeTextureCoordinates);

        GLES20.glEnableVertexAttribArray(mTextureCoordinateHandle);

        // Enable vertex arrays
        GLES20.glEnableVertexAttribArray(cubePositionParam);

        GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, 36);

        // Disable vertex arrays
        GLES20.glDisableVertexAttribArray(cubePositionParam);
        GLES20.glDisableVertexAttribArray(mTextureCoordinateHandle);
    }

    @Override
    public void onSurfaceCreated(EGLConfig config) {
        loadTexture(this.getBaseContext(), R.drawable.click_to_continue);

        GLES20.glClearColor(0.1f, 0.1f, 0.1f, 0.5f); // Dark background so text shows up well.

        ByteBuffer bbVertices = ByteBuffer.allocateDirect(Cube.CUBE_COORDS.length * 4);
        bbVertices.order(ByteOrder.nativeOrder());
        cubeVertices = bbVertices.asFloatBuffer();
        cubeVertices.put(Cube.CUBE_COORDS);
        cubeVertices.position(0);

        mCubeTextureCoordinates = ByteBuffer.allocateDirect(Cube.CUBE_TEXTURE_COORDINATES_DATA.length * mBytesPerFloat)
            .order(ByteOrder.nativeOrder()).asFloatBuffer();
        mCubeTextureCoordinates.put(Cube.CUBE_TEXTURE_COORDINATES_DATA).position(0);

        // make a floor
        int vertexShader = loadGLShader(GLES20.GL_VERTEX_SHADER, R.raw.cube_vertex);
        int passthroughShader = loadGLShader(GLES20.GL_FRAGMENT_SHADER, R.raw.cube_fragment);

        cubeProgram = GLES20.glCreateProgram();
        GLES20.glAttachShader(cubeProgram, vertexShader);
        GLES20.glAttachShader(cubeProgram, passthroughShader);
        GLES20.glLinkProgram(cubeProgram);
        GLES20.glUseProgram(cubeProgram);


        cubePositionParam = GLES20.glGetAttribLocation(cubeProgram, "a_Position");
        mTextureCoordinateHandle = GLES20.glGetAttribLocation(cubeProgram, "a_TexCoordinate");

        cubeModelParam = GLES20.glGetUniformLocation(cubeProgram, "u_Model");
        cubeModelViewParam = GLES20.glGetUniformLocation(cubeProgram, "u_MVMatrix");
        cubeModelViewProjectionParam = GLES20.glGetUniformLocation(cubeProgram, "u_MVP");
        mTextureUniformHandle = GLES20.glGetUniformLocation(cubeProgram, "u_Texture");

        updateModelPosition();
    }

    protected void updateModelPosition() {
        Matrix.setIdentityM(modelCube, 0);
        Matrix.translateM(modelCube, 0, modelPosition[0], modelPosition[1], modelPosition[2]);
    }

    private int loadGLShader(int type, int resId) {
        String code = readRawTextFile(resId);
        int shader = GLES20.glCreateShader(type);
        GLES20.glShaderSource(shader, code);
        GLES20.glCompileShader(shader);

        // Get the compilation status.
        final int[] compileStatus = new int[1];
        GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, compileStatus, 0);

        // If the compilation failed, delete the shader.
        if (compileStatus[0] == 0) {
            System.out.println("Error compiling shader: " + GLES20.glGetShaderInfoLog(shader));
            GLES20.glDeleteShader(shader);
            shader = 0;
        }

        if (shader == 0) {
            throw new RuntimeException("Error creating shader.");
        }

        return shader;
    }

    public int loadTexture(final Context context, final int resourceId)
    {

        GLES20.glGenTextures(1, textureHandle, 0);

        if (textureHandle[0] != 0)
        {
            final BitmapFactory.Options options = new BitmapFactory.Options();
            options.inScaled = false;   // No pre-scaling

            // Read in the resource
            final Bitmap bitmap = BitmapFactory.decodeResource(context.getResources(), resourceId, options);

            // Bind to the texture in OpenGL
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureHandle[0]);

            // Set filtering
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST);
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_NEAREST);


            GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_REPEAT);
            GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_REPEAT);

            // Load the bitmap into the bound texture.
            GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, bitmap, 0);

            // Recycle the bitmap, since its data has been loaded into OpenGL.
            bitmap.recycle();
        }

        if (textureHandle[0] == 0)
        {
            throw new RuntimeException("Error loading texture.");
        }

        return textureHandle[0];
    }

    private String readRawTextFile(int resId) {
        InputStream inputStream = getResources().openRawResource(resId);
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            reader.close();
            return sb.toString();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }


}
