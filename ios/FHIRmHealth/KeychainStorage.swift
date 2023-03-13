import Foundation

@objc(KeychainStorage)
class KeychainStorage: NSObject {
  @objc func store(_ key: String, value: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    guard let data = value.data(using: .utf8) else {
      reject("ERR_KEYCHAIN_FAILED_TO_CONVERT_VALUE", "Unable to convert value data", nil)
      return
    }
    let query: [String: Any] = [
      kSecClass.string: kSecClassGenericPassword,
      kSecAttrAccount.string: key,
      kSecValueData.string: data,
      kSecAttrAccessible.string: kSecAttrAccessibleWhenUnlocked,
    ]
    if SecItemAdd(query as CFDictionary, nil) == errSecSuccess {
      resolve(nil)
    } else {
      reject("ERR_KEYCHAIN_FAILED_TO_ADD_ITEM", "Unable to add item to keychain", nil)
    }
  }

  @objc func retrieve(_ key: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    let query: [String: Any] = [
      kSecClass.string: kSecClassGenericPassword,
      kSecAttrAccount.string: key,
      kSecReturnData.string: true,
      kSecMatchLimit.string: kSecMatchLimitOne,
    ]
    var data: CFTypeRef?
    switch SecItemCopyMatching(query as CFDictionary, &data) {
    case errSecSuccess:
      if let data = data as? Data, let value = String(data: data, encoding: .utf8) {
        resolve(value)
      } else {
        reject("ERR_KEYCHAIN_FAILED_TO_CONVERT_DATA", "Unable to convert keychain data", nil)
      }
    case errSecItemNotFound:
      resolve(nil)
    default:
      reject("ERR_KEYCHAIN_FAILED_TO_RETRIEVE_DATA", "Unable to retrieve data from keychain", nil)
    }
  }

  @objc func remove(_ key: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    let query: [String: Any] = [
      kSecClass.string: kSecClassGenericPassword,
      kSecAttrAccount.string: key,
    ]
    let deleteOperationResult = SecItemDelete(query as CFDictionary)
    if deleteOperationResult == errSecSuccess || deleteOperationResult == errSecItemNotFound {
      resolve(nil)
    } else {
      reject("ERR_KEYCHAIN_FAILED_TO_REMOVE", "Unable to remove item from keychain", nil)
    }
  }
}

private extension CFString {
  var string: String {
    self as String
  }
}
