//
// PasskeyPRF.swift
// Custom implementation of WebAuthn PRF extension for iOS
//

import Foundation
import CommonCrypto

/**
 * Custom PRF implementation using HMAC-SHA256
 * This implements the WebAuthn PRF extension specification
 */
internal class PasskeyPRF {
    
    /**
     * Implements PRF using HMAC-SHA256 as specified in WebAuthn PRF extension
     * 
     * @param credentialId The credential ID to use as the key material
     * @param salt The salt data (first or second from PRF values)
     * @returns The PRF output as Data
     */
    static func computePRF(credentialId: Data, salt: Data) -> Data? {
        // Use HMAC-SHA256 with credential ID as key and salt as data
        return hmacSHA256(key: credentialId, data: salt)
    }
    
    /**
     * Computes HMAC-SHA256
     * 
     * @param key The HMAC key
     * @param data The data to hash
     * @returns The HMAC-SHA256 result
     */
    private static func hmacSHA256(key: Data, data: Data) -> Data? {
        let hashLength = Int(CC_SHA256_DIGEST_LENGTH)
        var result = Data(count: hashLength)
        
        result.withUnsafeMutableBytes { resultBytes in
            data.withUnsafeBytes { dataBytes in
                key.withUnsafeBytes { keyBytes in
                    CCHmac(
                        CCHmacAlgorithm(kCCHmacAlgSHA256),
                        keyBytes.baseAddress, key.count,
                        dataBytes.baseAddress, data.count,
                        resultBytes.baseAddress
                    )
                }
            }
        }
        
        return result
    }
    
    /**
     * Processes PRF extension inputs and returns outputs
     * 
     * @param credentialId The credential ID to use for PRF computation
     * @param prfInputs The PRF extension inputs
     * @returns The PRF extension outputs
     */
    static func processPRFExtension(
        credentialId: Data,
        prfInputs: AuthenticationExtensionsPRFInputs?
    ) -> AuthenticationExtensionsClientOutputs.AuthenticationExtensionsPRFOutputs? {
        
        guard let prfInputs = prfInputs else {
            return nil
        }
        
        var results: AuthenticationExtensionsPRFValues?
        
        if let evalValues = prfInputs.eval {
            // Process eval values
            if let firstResult = computePRF(credentialId: credentialId, salt: evalValues.first) {
                var secondResult: Data? = nil
                if let secondSalt = evalValues.second {
                    secondResult = computePRF(credentialId: credentialId, salt: secondSalt)
                }
                
                results = AuthenticationExtensionsPRFValues(
                    first: firstResult,
                    second: secondResult
                )
            }
        }
        
        // Note: evalByCredential is not implemented in this custom solution
        // as it would require credential-specific handling which is complex
        
        return AuthenticationExtensionsClientOutputs.AuthenticationExtensionsPRFOutputs(
            enabled: true,
            results: results
        )
    }
}

/**
 * Extension to convert AuthenticationExtensionsPRFOutputs to JSON format
 */
extension AuthenticationExtensionsClientOutputs.AuthenticationExtensionsPRFOutputs {
    func toJSON() -> AuthenticationExtensionsPRFOutputsJSON {
        return AuthenticationExtensionsPRFOutputsJSON(
            enabled: self.enabled,
            results: self.results?.toJSON()
        )
    }
}

/**
 * Extension to convert AuthenticationExtensionsPRFValues to JSON format
 */
extension AuthenticationExtensionsPRFValues {
    func toJSON() -> AuthenticationExtensionsPRFValuesJSON {
        return AuthenticationExtensionsPRFValuesJSON(
            first: self.first.uInt8Array,
            second: self.second?.uInt8Array
        )
    }
}
