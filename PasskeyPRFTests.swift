//
// PasskeyPRFTests.swift
// Unit tests for PasskeyPRF functionality
//

import XCTest
import Foundation
@testable import Passkey

class PasskeyPRFTests: XCTestCase {
    
    override func setUp() {
        super.setUp()
        // 清理缓存以确保测试的独立性
        PasskeyPRF.clearCache()
    }
    
    override func tearDown() {
        PasskeyPRF.clearCache()
        super.tearDown()
    }
    
    // MARK: - 基础功能测试
    
    func testPRFImplementationInfo() {
        let info = PasskeyPRF.getPRFImplementationInfo()
        XCTAssertFalse(info.isEmpty, "PRF implementation info should not be empty")
        print("PRF Implementation: \(info)")
    }
    
    func testSupportsNativePRF() {
        let supports = PasskeyPRF.supportsNativePRF
        if #available(iOS 18.0, *) {
            XCTAssertTrue(supports, "Should support native PRF on iOS 18.0+")
        } else {
            XCTAssertFalse(supports, "Should not support native PRF on iOS <18.0")
        }
    }
    
    // MARK: - PRF 计算测试
    
    func testComputePRFWithValidInputs() {
        let credentialId = Data("test_credential_id".utf8)
        let salt = Data("test_salt".utf8)
        
        let result = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
        
        XCTAssertNotNil(result, "PRF computation should succeed with valid inputs")
        XCTAssertEqual(result?.count, 32, "HMAC-SHA256 should produce 32 bytes")
    }
    
    func testComputePRFWithEmptyCredentialId() {
        let credentialId = Data()
        let salt = Data("test_salt".utf8)
        
        let result = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
        
        XCTAssertNil(result, "PRF computation should fail with empty credential ID")
    }
    
    func testComputePRFWithEmptySalt() {
        let credentialId = Data("test_credential_id".utf8)
        let salt = Data()
        
        let result = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
        
        XCTAssertNil(result, "PRF computation should fail with empty salt")
    }
    
    func testComputePRFConsistency() {
        let credentialId = Data("test_credential_id".utf8)
        let salt = Data("test_salt".utf8)
        
        let result1 = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
        let result2 = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
        
        XCTAssertEqual(result1, result2, "PRF computation should be deterministic")
    }
    
    // MARK: - 缓存测试
    
    func testPRFCaching() {
        let credentialId = Data("test_credential_id".utf8)
        let salt = Data("test_salt".utf8)
        
        // 第一次计算
        let result1 = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
        XCTAssertNotNil(result1)
        
        // 检查缓存大小
        let cacheSize1 = PasskeyPRF.getCacheSize()
        XCTAssertEqual(cacheSize1, 1, "Cache should contain one entry")
        
        // 第二次计算应该使用缓存
        let result2 = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
        XCTAssertEqual(result1, result2, "Cached result should be identical")
        
        // 缓存大小应该保持不变
        let cacheSize2 = PasskeyPRF.getCacheSize()
        XCTAssertEqual(cacheSize2, 1, "Cache size should remain the same")
    }
    
    func testClearCache() {
        let credentialId = Data("test_credential_id".utf8)
        let salt = Data("test_salt".utf8)
        
        // 计算并缓存
        _ = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
        XCTAssertEqual(PasskeyPRF.getCacheSize(), 1)
        
        // 清理缓存
        PasskeyPRF.clearCache()
        XCTAssertEqual(PasskeyPRF.getCacheSize(), 0, "Cache should be empty after clearing")
    }
    
    // MARK: - 随机盐生成测试
    
    func testGenerateSecureRandomSalt() {
        let salt = PasskeyPRF.generateSecureRandomSalt()
        
        XCTAssertNotNil(salt, "Random salt generation should succeed")
        XCTAssertEqual(salt?.count, 32, "Default salt length should be 32 bytes")
    }
    
    func testGenerateSecureRandomSaltWithCustomLength() {
        let customLength = 16
        let salt = PasskeyPRF.generateSecureRandomSalt(length: customLength)
        
        XCTAssertNotNil(salt, "Random salt generation should succeed")
        XCTAssertEqual(salt?.count, customLength, "Salt length should match requested length")
    }
    
    func testGenerateSecureRandomSaltWithInvalidLength() {
        let salt = PasskeyPRF.generateSecureRandomSalt(length: 0)
        
        XCTAssertNil(salt, "Random salt generation should fail with invalid length")
    }
    
    func testGenerateSecureRandomSaltUniqueness() {
        let salt1 = PasskeyPRF.generateSecureRandomSalt()
        let salt2 = PasskeyPRF.generateSecureRandomSalt()
        
        XCTAssertNotEqual(salt1, salt2, "Generated salts should be unique")
    }
    
    // MARK: - 测试数据创建测试
    
    func testCreateTestPRFInputs() {
        let testInputs = PasskeyPRF.createTestPRFInputs()
        
        XCTAssertNotNil(testInputs.eval, "Test inputs should have eval values")
        XCTAssertNotNil(testInputs.eval?.first, "Test inputs should have first salt")
        XCTAssertNotNil(testInputs.eval?.second, "Test inputs should have second salt")
        XCTAssertNil(testInputs.evalByCredential, "Test inputs should not have evalByCredential")
    }
    
    // MARK: - 输入验证测试
    
    func testValidatePRFInputsWithValidEval() {
        let firstSalt = Data("first_salt".utf8)
        let secondSalt = Data("second_salt".utf8)
        // 创建 JSON 数据然后解码
        let evalJsonData = try! JSONEncoder().encode([
            "first": Array(firstSalt),
            "second": Array(secondSalt)
        ])
        let evalValues = try! JSONDecoder().decode(AuthenticationExtensionsPRFValues.self, from: evalJsonData)
        let jsonData = try! JSONEncoder().encode([
            "eval": [
                "first": Array(firstSalt),
                "second": Array(secondSalt)
            ]
        ])
        let prfInputs = try! JSONDecoder().decode(AuthenticationExtensionsPRFInputs.self, from: jsonData)
        
        let isValid = PasskeyPRF.validatePRFInputs(prfInputs)
        XCTAssertTrue(isValid, "Valid PRF inputs should pass validation")
    }
    
    func testValidatePRFInputsWithEmptyFirstSalt() {
        let firstSalt = Data()
        let secondSalt = Data("second_salt".utf8)
        // 创建 JSON 数据然后解码
        let evalJsonData = try! JSONEncoder().encode([
            "first": Array(firstSalt),
            "second": Array(secondSalt)
        ])
        let evalValues = try! JSONDecoder().decode(AuthenticationExtensionsPRFValues.self, from: evalJsonData)
        let jsonData = try! JSONEncoder().encode([
            "eval": [
                "first": Array(firstSalt),
                "second": Array(secondSalt)
            ]
        ])
        let prfInputs = try! JSONDecoder().decode(AuthenticationExtensionsPRFInputs.self, from: jsonData)
        
        let isValid = PasskeyPRF.validatePRFInputs(prfInputs)
        XCTAssertFalse(isValid, "PRF inputs with empty first salt should fail validation")
    }
    
    func testValidatePRFInputsWithEmptySecondSalt() {
        let firstSalt = Data("first_salt".utf8)
        let secondSalt = Data()
        // 创建 JSON 数据然后解码
        let evalJsonData = try! JSONEncoder().encode([
            "first": Array(firstSalt),
            "second": Array(secondSalt)
        ])
        let evalValues = try! JSONDecoder().decode(AuthenticationExtensionsPRFValues.self, from: evalJsonData)
        let jsonData = try! JSONEncoder().encode([
            "eval": [
                "first": Array(firstSalt),
                "second": Array(secondSalt)
            ]
        ])
        let prfInputs = try! JSONDecoder().decode(AuthenticationExtensionsPRFInputs.self, from: jsonData)
        
        let isValid = PasskeyPRF.validatePRFInputs(prfInputs)
        XCTAssertFalse(isValid, "PRF inputs with empty second salt should fail validation")
    }
    
    // MARK: - 性能测试
    
    func testPRFPerformance() {
        let credentialId = Data("performance_test_credential_id".utf8)
        let salt = Data("performance_test_salt".utf8)
        
        measure {
            for _ in 0..<100 {
                _ = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
            }
        }
    }
    
    func testCachedPRFPerformance() {
        let credentialId = Data("cached_performance_test_credential_id".utf8)
        let salt = Data("cached_performance_test_salt".utf8)
        
        // 预热缓存
        _ = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
        
        measure {
            for _ in 0..<1000 {
                _ = PasskeyPRF.computePRF(credentialId: credentialId, salt: salt)
            }
        }
    }
}
