#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(KeychainStorage, NSObject)

RCT_EXTERN_METHOD(store:(NSString*)key
                  value:(NSString*)value
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
