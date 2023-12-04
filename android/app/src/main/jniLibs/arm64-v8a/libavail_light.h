#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <jni.h>
#include <android/log.h>
#include <jni.h>

#define CELL_WITH_PROOF_SIZE (CELL_SIZE + PROOF_SIZE)

typedef void (*FfiCallback)(const uint8_t *data);


__android_log_write(ANDROID_LOG_ERROR, "Tag", "Error here");

__attribute__((visibility("default"))) bool startLightNode(uint8_t *cfg);

__attribute__((visibility("default"))) const uint8_t *latestBlock(uint8_t *cfg);

__attribute__((visibility("default"))) const uint8_t *status(uint32_t app_id, uint8_t *cfg);

__attribute__((visibility("default"))) const uint8_t *confidence(uint32_t block, uint8_t *cfg);

__attribute__((visibility("default"))) bool startLightNodeWithCallback(uint8_t *cfg, const FfiCallback ffi_callback);

__attribute__((visibility("default"))) const uint8_t *submitTransaction(uint8_t *cfg, uint32_t app_id, uint8_t *transaction, uint8_t *private_key);

__attribute__((visibility("default"))) const uint8_t *getStatusV2(uint8_t *cfg);

extern "C"
JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_startNode
  (JNIEnv *, jclass, jstring);

JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_startNodeWithBroadcastsToDb
  (JNIEnv *, jclass, jstring);

JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_latestBlock
  (JNIEnv *, jclass, jstring);
JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_confidence
  (JNIEnv *, jclass, jstring, jint);
JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_status
  (JNIEnv *, jclass, jstring, jint);
JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_getStatusV2
  (JNIEnv *, jclass, jstring);


JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_startNodeWithCallback
  (JNIEnv *, jclass, jstring, jobject);


JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_getConfidenceMessageList
  (JNIEnv *, jclass, jstring);
JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_getHeaderVerifiedMessageList
  (JNIEnv *, jclass, jstring);
JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_getDataVerifiedMessageList
  (JNIEnv *, jclass, jstring);


JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_getBlock
  (JNIEnv *, jclass, jstring);

JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_getBlockHeader
  (JNIEnv *, jclass, jstring, jint);

JNIEXPORT jstring JNICALL Java_app_subwallet_mobile_MainActivity_getBlockData
  (JNIEnv *, jclass, jstring, jint, jbool, jbool);
