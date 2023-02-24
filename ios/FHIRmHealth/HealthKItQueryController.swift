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
}
