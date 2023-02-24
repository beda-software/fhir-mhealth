#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(HealthKitQueryController, NSObject)

RCT_EXTERN_METHOD(start)
RCT_EXTERN_METHOD(stop)
RCT_EXTERN_METHOD(reset)

+(BOOL)requiresMainQueueSetup {
  return NO;
}

@end
