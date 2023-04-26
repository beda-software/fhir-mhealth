@objc(HealthKitQuery)
class HealthKitQuery: NSObject {
  @objc func activitySummary(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    do {
      try HealthKitConnector.shared.queryActivitySummary { activitySummary in
        resolve(activitySummary?.serialized)
      }
    } catch {
      reject("ERR_QUERY_FAILED", "Can not query for latest activity summary", error)
    }
  }
}
