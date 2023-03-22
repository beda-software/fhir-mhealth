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

  static func reset() {
    UserDefaults.standard.removeObject(forKey: PersistanceKeys.historyAnchor)
  }
}

@objc
class HealthKitConnector: NSObject {
  private let store = HKHealthStore()
  private var runningQuery: HKAnchoredObjectQuery? = nil
  private var queryAnchor: HKQueryAnchor? = HealthKitHistory.restore()
  private var eventChannels: [HealthKitEventChannel] = []
  private var eventDeliveryQueue: [HealthKitEvent] = []

  static let shared = HealthKitConnector()

  var queryStatus: HealthKitQueryStatus {
    runningQuery == nil ? .stopped : .running
  }

  private override init() {
    super.init()
  }

  @objc class func sharedInstance() -> HealthKitConnector {
    return HealthKitConnector.shared
  }

  func connectEventChannel(_ channelMediator: HealthKitEventChannel) {
    self.eventChannels.append(channelMediator)
    self.eventDeliveryQueue.forEach({channelMediator.notify(of: $0)})
  }

  func disconnectEventChannel(_ channelMediator: HealthKitEventChannel) {
    self.eventChannels.removeAll(where: {$0 === channelMediator})
  }

  @objc func launchBackgroundQuery() {
    guard HKHealthStore.isHealthDataAvailable() else {
      logger.debug("HKHealthStore is not supported on this platform")
      return
    }
    guard self.runningQuery == nil else {
      logger.error("Attempted to launch query while another is in progress")
      return
    }
    store.requestAuthorization(toShare: [], read: [HKObjectType.workoutType()]) { _,_ in
      let anchoredQuery = HKAnchoredObjectQuery(type: HKQuantityType.workoutType(),
                                                predicate: self.queryAnchor == nil ? HKQuery.predicateForSamples(
                                                  withStart: Calendar.current.date(byAdding: .day, value: -1, to: .now),
                                                  end: nil,
                                                  options: []
                                                ) : nil,
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
      self.runningQuery = anchoredQuery
      self.distribute(event: .queryStatusHasChanged(.running))
    }
  }

  func stopBackgroundQuery() {
    if let query = self.runningQuery {
      self.store.stop(query)
      self.runningQuery = nil
      self.distribute(event: .queryStatusHasChanged(.stopped))
    }
  }

  func resetBackgroundQuery() {
    self.stopBackgroundQuery()
    HealthKitHistory.reset()
    self.queryAnchor = nil
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
      distribute(event: .samplesCreated(samples))
    }

    if let objects = objectsRemoved, !objects.isEmpty {
      distribute(event: .objectsRemoved(objects))
    }

    if let anchor = historyPointAnchor {
      HealthKitHistory.checkpoint(at: anchor)
      self.queryAnchor = anchor
    }
  }

  private func distribute(event: HealthKitEvent) {
    if self.eventChannels.isEmpty {
      self.eventDeliveryQueue.append(event)
    } else {
      self.eventChannels.forEach({$0.notify(of: event)})
    }
  }
}

extension HKSample {
  var summary: [String: Any?] {
    [
      "id": self.uuid.uuidString,
      "startDate": self.startDate.ISO8601Format(),
      "endDate": self.endDate.ISO8601Format(),
      "category": self.category,
      "code": self.code,
      "display": self.display,
    ].merging(
      self.details, uniquingKeysWith: {(current, _) in current}
    )
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

  var category: String? {
    switch self {
    case _ as HKWorkout:
      return "workout"
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

  var details: [String: Any?] {
    switch self {
    case let workout as HKWorkout:
      var workoutDetails: [String: Any?] = ["duration": workout.duration]
      if #available(iOS 16.0, *) {
        let activeEnergyBurned = workout.statistics(for: HKQuantityType(.activeEnergyBurned))?.sumQuantity()
        workoutDetails.merge(
          [
            "activeEnergyBurned": activeEnergyBurned?.doubleValue(for: HKUnit(from: .kilocalorie)),
          ],
          uniquingKeysWith: {(_, other) in other}
        )
      }
      return workoutDetails
    case _ as HKQuantitySample:
      return [:]
    case _ as HKCategorySample:
      return [:]
    case _ as HKCorrelation:
      return [:]
    default:
      return [:]
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
      return "Hockey"
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
