@objc(HealthKitQueryController)
class HealthKitQueryController: NSObject {
  @objc func start(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    HealthKitConnector.shared.launchBackgroundQuery()
    resolve(nil)
  }

  @objc func stop(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    HealthKitConnector.shared.stopBackgroundQuery()
    resolve(nil)
  }

  @objc func reset(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    HealthKitConnector.shared.resetBackgroundQuery()
    resolve(nil)
  }

  @objc func status(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(HealthKitConnector.shared.queryStatus.rawValue)
  }
}
