import Foundation
import HealthKit
import os
import React

fileprivate let logger = Logger(subsystem: Bundle.main.bundleIdentifier!, category: "HealthKitConnector")

fileprivate class HealthKitHistory {
  private enum PersistanceKeys {
    static let historyAnchor = "hk-history-anchor"
  }

  static func checkpoint(at anchor: HKQueryAnchor) {
    do {
      UserDefaults.standard.set(
        try NSKeyedArchiver.archivedData(withRootObject: anchor, requiringSecureCoding: true).base64EncodedString(),
        forKey: PersistanceKeys.historyAnchor
      )
    } catch {
      logger.error("Failed to archive HKQueryAnchor: \(error)")
    }
  }

  static func restore() -> HKQueryAnchor? {
    if let encodedArchive = UserDefaults.standard.string(forKey: PersistanceKeys.historyAnchor) {
      if let archive = Data(base64Encoded: encodedArchive) {
        return try? NSKeyedUnarchiver.unarchivedObject(ofClass: HKQueryAnchor.self, from: archive)
      }
    }
    return nil
  }
}

fileprivate enum HealthKitEvents {
  case samplesCreated([HKSample])
  case objectsRemoved([HKDeletedObject])

  private static let samplesCreatedEventCode = "hk-sample-created"
  private static let objectsRemovedEventCode = "hk-object-removed"

  var code: String {
    switch self {
    case .samplesCreated:
      return HealthKitEvents.samplesCreatedEventCode
    case .objectsRemoved:
      return HealthKitEvents.objectsRemovedEventCode
    }
  }

  static var list: [String] {
    [HealthKitEvents.samplesCreatedEventCode, HealthKitEvents.objectsRemovedEventCode]
  }
}

@objc(HealthKitEventEmitter)
class HealthKitEventEmitter: RCTEventEmitter {
  private(set) var beingObserved = false

  override init() {
    super.init()
    HealthKitConnector.shared.useEventEmitter(self)
  }

  @objc override class func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc override func supportedEvents() -> [String] {
    HealthKitEvents.list
  }

  @objc override func startObserving() {
    self.beingObserved = true
  }

  @objc override func stopObserving() {
    self.beingObserved = false
  }
}

@objc
class HealthKitConnector: NSObject {
  private let store = HKHealthStore()
  private var queryAnchor: HKQueryAnchor? = HealthKitHistory.restore()
  private var eventEmitter: HealthKitEventEmitter?

  static let shared = HealthKitConnector()

  private override init() {
    super.init()
  }

  @objc
  class func sharedInstance() -> HealthKitConnector {
    return HealthKitConnector.shared
  }

  func useEventEmitter(_ emitter: HealthKitEventEmitter) {
    self.eventEmitter = emitter
  }

  @objc
  func launchBackgroundQuery() {
    guard HKHealthStore.isHealthDataAvailable() else {
      logger.debug("HKHealthStore is not supported on this platform")
      return
    }
    store.requestAuthorization(toShare: [], read: [HKObjectType.workoutType()]) { _,_ in
      let anchoredQuery = HKAnchoredObjectQuery(type: HKQuantityType.workoutType(),
                                                predicate: nil,
                                                anchor: self.queryAnchor,
                                                limit: HKObjectQueryNoLimit) {_, created, removed, anchor, error in
        self.storeUpdateHandler(created, removed, anchor, error)
      }
      anchoredQuery.updateHandler = {_, created, removed, anchor, error in
        self.storeUpdateHandler(created, removed, anchor, error)
      }
      self.store.execute(anchoredQuery)
      self.store.enableBackgroundDelivery(for: HKQuantityType.workoutType(), frequency: .immediate) {_,error in
        if error != nil {
          logger.error("Failed to enabled background updates delivery: \(error)")
        }
      }
    }
  }

  private func storeUpdateHandler(_ samplesCreated: [HKSample]?,
                                  _ objectsRemoved: [HKDeletedObject]?,
                                  _ historyPointAnchor: HKQueryAnchor?,
                                  _ error: Error?) {
    guard error == nil else {
      logger.error("Failed to get latest store update: \(error)")
      return
    }

    if let samples = samplesCreated, !samples.isEmpty {
      notify(on: .samplesCreated(samples))
    }

    if let objects = objectsRemoved, !objects.isEmpty {
      notify(on: .objectsRemoved(objects))
    }

    if let anchor = historyPointAnchor {
      HealthKitHistory.checkpoint(at: anchor)
    }
  }

  private func notify(on event: HealthKitEvents) {
    var updates: [[String: String?]] = []
    switch event {
    case .samplesCreated(let created):
      updates.append(contentsOf: created.map({$0.summary}))
    case .objectsRemoved(let removed):
      updates.append(contentsOf: removed.map({["id": $0.uuid.uuidString]}))
    }
    self.eventEmitter?.sendEvent(withName: event.code, body: updates)
  }
}

extension HKSample {
  var summary: [String: String?] {
    return ["id": self.uuid.uuidString, "code": self.code, "display": self.display]
  }

  var code: String? {
    switch self {
    case let workout as HKWorkout:
      return workout.activityDisplay.lowercased().replacingOccurrences(of: " ", with: "-")
    case _ as HKQuantitySample:
      return nil
    case _ as HKCategorySample:
      return nil
    case _ as HKCorrelation:
      return nil
    default:
      return nil
    }
  }

  var display: String? {
    switch self {
    case let workout as HKWorkout:
      return workout.activityDisplay
    case _ as HKQuantitySample:
      return nil
    case _ as HKCategorySample:
      return nil
    case _ as HKCorrelation:
      return nil
    default:
      return nil
    }
  }
}

extension HKWorkout {
  var activityDisplay: String {
    switch self.workoutActivityType {
    case .americanFootball:
      return "American Football"
    case .archery:
      return "Archery"
    case .australianFootball:
      return "Australian Football"
    case .badminton:
      return "Badminton"
    case .baseball:
      return "Baseball"
    case .basketball:
      return "Basketball"
    case .bowling:
      return "Bowling"
    case .boxing:
      return "Boxing"
    case .climbing:
      return "Climbing"
    case .cricket:
      return "Cricket"
    case .crossTraining:
      return "Cross Training"
    case .curling:
      return "Curling"
    case .cycling:
      return "Cycling"
    case .dance:
      return "Dance"
    case .danceInspiredTraining:
      return "Dance Inspired Training"
    case .elliptical:
      return "Elliptical"
    case .equestrianSports:
      return "Equestrian Sports"
    case .fencing:
      return "Fencing"
    case .fishing:
      return "Fishing"
    case .functionalStrengthTraining:
      return "Functional Strength Training"
    case .golf:
      return "Golf"
    case .gymnastics:
      return "Gymnastics"
    case .handball:
      return "Handball"
    case .hiking:
      return "Hiking"
    case .hockey:
      return "Hocket"
    case .hunting:
      return "Hunting"
    case .lacrosse:
      return "Lacrosse"
    case .martialArts:
      return "Martial Arts"
    case .mindAndBody:
      return "Mind And Body"
    case .mixedMetabolicCardioTraining:
      return "Mixed Metabolic Cardio Training"
    case .paddleSports:
      return "Paddle Sports"
    case .play:
      return "Play"
    case .preparationAndRecovery:
      return "Preparation And Recovery"
    case .racquetball:
      return "Racquetball"
    case .rowing:
      return "Rowing"
    case .rugby:
      return "Rugby"
    case .running:
      return "Running"
    case .sailing:
      return "Sailing"
    case .skatingSports:
      return "Skating Sports"
    case .snowSports:
      return "Snow Sports"
    case .soccer:
      return "Soccer"
    case .softball:
      return "Softball"
    case .squash:
      return "Squash"
    case .stairClimbing:
      return "Stair Climbing"
    case .surfingSports:
      return "Surfing Sports"
    case .swimming:
      return "Swimming"
    case .tableTennis:
      return "Table Tennis"
    case .tennis:
      return "Tennis"
    case .trackAndField:
      return "Track And Field"
    case .traditionalStrengthTraining:
      return "Traditional Strength Training"
    case .volleyball:
      return "Volleyball"
    case .walking:
      return "Walking"
    case .waterFitness:
      return "Water Fitness"
    case .waterPolo:
      return "Water Polo"
    case .waterSports:
      return "Water Sports"
    case .wrestling:
      return "Wrestling"
    case .yoga:
      return "Yoga"
    case .barre:
      return "Barre"
    case .coreTraining:
      return "Core Training"
    case .crossCountrySkiing:
      return "Cross Country Skiing"
    case .downhillSkiing:
      return "Downhill Skiing"
    case .flexibility:
      return "Flexibility"
    case .highIntensityIntervalTraining:
      return "High Intensity Interval Training"
    case .jumpRope:
      return "Jump Rope"
    case .kickboxing:
      return "Kickboxing"
    case .pilates:
      return "Pilates"
    case .snowboarding:
      return "Snowboarding"
    case .stairs:
      return "Stairs"
    case .stepTraining:
      return "Step Training"
    case .wheelchairWalkPace:
      return "Wheelchair Walk Pace"
    case .wheelchairRunPace:
      return "Wheelchair Run Pace"
    case .taiChi:
      return "Tai Chi"
    case .mixedCardio:
      return "Mixed Cardio"
    case .handCycling:
      return "Hand Cycling"
    case .discSports:
      return "Disc Sports"
    case .fitnessGaming:
      return "Fitness Gaming"
    case .cardioDance:
      return "Cardio Dance"
    case .socialDance:
      return "Social Dance"
    case .pickleball:
      return "Pickleball"
    case .cooldown:
      return "Cooldown"
    case .swimBikeRun:
      return "Swim Bike Run"
    case .transition:
      return "Transition"
    case .other:
      return "Other"
    @unknown default:
      return "Unknown"
    }
  }
}
