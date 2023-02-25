import HealthKit

enum HealthKitQueryStatus: String {
  case running = "running"
  case stopped = "stopped"
}

enum HealthKitEvents {
  case samplesCreated([HKSample])
  case objectsRemoved([HKDeletedObject])

  case queryStatusHasChanged(HealthKitQueryStatus)

  private static let samplesCreatedEventCode = "HK_SAMPLE_CREATED"
  private static let objectsRemovedEventCode = "HK_OBJECT_REMOVED"
  private static let queryStatusHasChangedEventCode = "HK_QUERY_STATUS_HAS_CHANGED"

  var code: String {
    switch self {
    case .samplesCreated:
      return HealthKitEvents.samplesCreatedEventCode
    case .objectsRemoved:
      return HealthKitEvents.objectsRemovedEventCode
    case .queryStatusHasChanged:
      return HealthKitEvents.queryStatusHasChangedEventCode
    }
  }

  static var list: [String] {
    [
      HealthKitEvents.samplesCreatedEventCode,
      HealthKitEvents.objectsRemovedEventCode,
      HealthKitEvents.queryStatusHasChangedEventCode,
    ]
  }
}

@objc(HealthKitEventChannel)
class HealthKitEventChannel: RCTEventEmitter {
  @objc override class func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc override func supportedEvents() -> [String] {
    HealthKitEvents.list
  }

  @objc override func startObserving() {
    HealthKitConnector.shared.connectEventChannel(self)
  }

  @objc override func stopObserving() {
    HealthKitConnector.shared.disconnectEventChannel(self)
  }

  @objc override func constantsToExport() -> [AnyHashable : Any] {
    HealthKitEvents.list.reduce(into: [String: String](), {$0[$1] = $1})
  }
}
