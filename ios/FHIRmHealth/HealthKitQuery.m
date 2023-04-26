#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(HealthKitQuery, NSObject)

RCT_EXTERN_METHOD(activitySummary:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+(BOOL)requiresMainQueueSetup {
  return NO;
}

@end
