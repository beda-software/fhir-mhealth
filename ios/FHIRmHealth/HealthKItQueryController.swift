@objc(HealthKitQueryController)
class HealthKitQueryController: NSObject {
  @objc func start() {
    HealthKitConnector.shared.launchBackgroundQuery()
  }

  @objc func stop() {
    HealthKitConnector.shared.stopBackgroundQuery()
  }

  @objc func reset() {
    HealthKitConnector.shared.resetBackgroundQuery()
  }

  @objc func status(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(HealthKitConnector.shared.queryStatus.rawValue)
  }
}
