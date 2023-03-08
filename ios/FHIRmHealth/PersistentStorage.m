#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PersistentStorage, NSObject)

RCT_EXTERN_METHOD(store:(NSString*)key
                  data:(NSString*)data
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(retrieve:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(remove:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+(BOOL)requiresMainQueueSetup {
  return NO;
}

@end
