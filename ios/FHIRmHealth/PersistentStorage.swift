import Foundation
import React

@objc(PersistentStorage)
class PersistentStorage: NSObject {
  @objc func store(_ key: String, value: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    do {
      let archive = try NSKeyedArchiver.archivedData(withRootObject: NSString(string: value),
                                                     requiringSecureCoding: true) as NSData
      var filepath = try constructStoragePath(for: key)

      try archive.compressed(using: .lz4).write(to: filepath, options: .completeFileProtection)

      var archiveAttributes = URLResourceValues()
      archiveAttributes.isExcludedFromBackup = true
      try filepath.setResourceValues(archiveAttributes)

      resolve(nil)
    } catch {
      reject("ERR_PERSISTENT_STORE_FAILED", "Failed to store data to persistent storage", error)
    }
  }

  @objc func retrieve(_ key: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    do {
      let filepath = try constructStoragePath(for: key)
      let archive = try NSData(contentsOf: filepath, options: .uncached)
      let data = try NSKeyedUnarchiver.unarchivedObject(ofClass: NSString.self,
                                                        from: archive.decompressed(using: .lz4) as Data)
      resolve(data)
    } catch {
      reject("ERR_PERSISTENT_RETRIEVE_FAILED", "Failed to retrieve data from persistent storage", error)
    }
  }

  @objc func remove(_ key: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    do {
      try FileManager.default.removeItem(at: try constructStoragePath(for: key))
      resolve(nil)
    } catch {
      reject("ERR_PERSISTENT_REMOVE_FAILED", "Failed to remove data from persistent storage", error)
    }
  }

  private func constructStoragePath(for filename: String) throws -> URL {
    let applicationSupportDirectory = try FileManager.default.url(for: .applicationSupportDirectory,
                                                                  in: .userDomainMask,
                                                                  appropriateFor: nil,
                                                                  create: true)
    let bundleSpecificStorage = applicationSupportDirectory.appendingPathComponent(Bundle.main.bundleIdentifier!)
    try FileManager.default.createDirectory(at: bundleSpecificStorage, withIntermediateDirectories: true)
    return bundleSpecificStorage.appendingPathComponent(filename)
  }
}
