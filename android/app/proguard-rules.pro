# ProGuard rules for SubWallet Mobile (React Native)
# ============================================================

# ---------------------------------------------------------------------------
# React Native core
# ---------------------------------------------------------------------------
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep ReactMethod-annotated methods (native modules)
-keep @com.facebook.react.bridge.ReactModule class * { *; }
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule {
    @com.facebook.react.bridge.ReactMethod <methods>;
    @com.facebook.react.bridge.ReactSyncHook <methods>;
}

# Keep ReactPackage implementations
-keep class * implements com.facebook.react.ReactPackage { *; }

# ---------------------------------------------------------------------------
# Hermes JS engine
# ---------------------------------------------------------------------------
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.hermes.intl.** { *; }

# ---------------------------------------------------------------------------
# Kotlin
# ---------------------------------------------------------------------------
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# ---------------------------------------------------------------------------
# AndroidX
# ---------------------------------------------------------------------------
-keep class androidx.biometric.** { *; }
-dontwarn androidx.**

# react-native-screens restores fragments by their runtime class names.
-keepnames class com.swmansion.rnscreens.**

# ---------------------------------------------------------------------------
# Fresco (animated GIF / WebP support)
# ---------------------------------------------------------------------------
-keep class com.facebook.imagepipeline.** { *; }
-keep class com.facebook.fresco.** { *; }
-keep class com.facebook.drawee.** { *; }
-keep class com.facebook.datasource.** { *; }
-dontwarn com.facebook.fresco.**

# ---------------------------------------------------------------------------
# react-native-config
# ---------------------------------------------------------------------------
# RNCConfigModuleImpl resolves the app's BuildConfig purely by reflection
# (Class.forName(packageName + ".BuildConfig"), then getDeclaredFields()), so R8
# sees nothing referencing the class and deletes it outright. Class.forName then
# throws, the module hands JS an empty config, and every env value reads back
# undefined in release builds -- the buy-token endpoints and keys, BUNDLE_ENV and
# the DEV_MODE flag alike. Keep the class and its fields so the env file survives
# minification.
-keep class app.subwallet.mobile.BuildConfig { *; }

# ---------------------------------------------------------------------------
# react-native-vision-camera
# ---------------------------------------------------------------------------
# The frame processor layer crosses into Java from C++ through fbjni, which
# resolves classes by their descriptor string (kJavaDescriptor in
# cpp/frameprocessors/java-bindings/*.h). R8 sees no bytecode reference to those
# names, so it is free to rename the classes -- and it did: Orientation,
# PixelFormat and JSUnionValue were minified to X6.i/X6.l/X6.h, which would make
# the C++ lookups fail at runtime. Frame processors are currently disabled here
# (react-native-worklets-core is not installed) so nothing calls this path today,
# but the QR scanner runs on this library and the failure would be silent until
# someone adds worklets-core. VisionCamera ships no consumer rules of its own.
-keep class com.mrousavy.camera.core.types.** { *; }
-keep class com.mrousavy.camera.frameprocessors.** { *; }

# ---------------------------------------------------------------------------
# JavaScript Interface (WebView bridge)
# ---------------------------------------------------------------------------
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ---------------------------------------------------------------------------
# Enums (prevent stripping)
# ---------------------------------------------------------------------------
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ---------------------------------------------------------------------------
# Serializable / Parcelable
# ---------------------------------------------------------------------------
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# ---------------------------------------------------------------------------
# Suppress warnings for known missing optional deps
# ---------------------------------------------------------------------------
-dontwarn com.google.android.gms.**
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**

# ---------------------------------------------------------------------------
# Crash reporting: keep source file names & line numbers
# ---------------------------------------------------------------------------
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
