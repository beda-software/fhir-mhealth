import HealthKit

enum HealthKitQueryStatus: String {
  case running = "running"
  case stopped = "stopped"
}

enum HealthKitEvent {
  case samplesCreated([HKSample])
  case objectsRemoved([HKDeletedObject])

  case queryStatusHasChanged(HealthKitQueryStatus)

  private static let samplesCreatedEventCode = "HK_SAMPLE_CREATED"
  private static let objectsRemovedEventCode = "HK_OBJECT_REMOVED"
  private static let queryStatusHasChangedEventCode = "HK_QUERY_STATUS_HAS_CHANGED"

  var code: String {
    switch self {
    case .samplesCreated:
      return HealthKitEvent.samplesCreatedEventCode
    case .objectsRemoved:
      return HealthKitEvent.objectsRemovedEventCode
    case .queryStatusHasChanged:
      return HealthKitEvent.queryStatusHasChangedEventCode
    }
  }

  static var events: [String] {
    [
      HealthKitEvent.samplesCreatedEventCode,
      HealthKitEvent.objectsRemovedEventCode,
      HealthKitEvent.queryStatusHasChangedEventCode,
    ]
  }
}

@objc(HealthKitEventChannel)
class HealthKitEventChannel: RCTEventEmitter {
  func notify(of event: HealthKitEvent) {
    var update: Any?
    switch event {
    case .samplesCreated(let created):
      update = created.map({$0.summary})
    case .objectsRemoved(let removed):
      update = removed.map({["id": $0.uuid.uuidString]})
    case .queryStatusHasChanged(let status):
      update = status.rawValue
    }
    self.sendEvent(withName: event.code, body: update)
  }

  @objc override class func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc override func supportedEvents() -> [String] {
    HealthKitEvent.events
  }

  @objc override func startObserving() {
    HealthKitConnector.shared.connectEventChannel(self)
  }

  @objc override func stopObserving() {
    HealthKitConnector.shared.disconnectEventChannel(self)
  }

  @objc override func constantsToExport() -> [AnyHashable : Any] {
    HealthKitEvent.events.reduce(into: [String: String](), {$0[$1] = $1})
  }
}
