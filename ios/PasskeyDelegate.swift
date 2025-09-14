import Foundation
import AuthenticationServices

@available(iOS 15.0, *)
protocol RNPasskeyResultHandler {
  func onSuccess(_ data: PublicKeyCredentialJSON)
  func onError(_ error: Error)
}

@objc(PasskeyDelegate)
@available(iOS 15.0, *)
class PasskeyDelegate: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
  private let _completionHandler: RNPasskeyResultHandler
  private var _originalRequest: String? // Store original request for PRF processing
  
  // Initializes delegate with a completion handler (callback function)
  init(completionHandler: RNPasskeyResultHandler, originalRequest: String? = nil) {
    _completionHandler = completionHandler;
    _originalRequest = originalRequest;
  }
  
  // Perform the authorization request for a given ASAuthorizationController instance
  func performAuthForController(controller: ASAuthorizationController) {
    controller.delegate = self;
    controller.presentationContextProvider = self;
    controller.performRequests();
  }
  
  func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
    return UIApplication
      .shared
      .connectedScenes
      .compactMap { ($0 as? UIWindowScene)?.keyWindow }
      .last ?? ASPresentationAnchor()
  }
  
  // Helper method to convert [String: Any] to AuthenticationExtensionsPRFOutputsJSON
  private func convertToPRFOutputsJSON(_ prfOutput: [String: Any]?) -> AuthenticationExtensionsPRFOutputsJSON? {
    guard let prfOutput = prfOutput else { return nil }
    
    let enabled = prfOutput["enabled"] as? Bool
    var results: AuthenticationExtensionsPRFValuesJSON?
    
    if let resultsDict = prfOutput["results"] as? [String: Any] {
      let first = resultsDict["first"] as? [UInt8] ?? []
      let second = resultsDict["second"] as? [UInt8]
      results = AuthenticationExtensionsPRFValuesJSON(first: first, second: second)
    }
    
    return AuthenticationExtensionsPRFOutputsJSON(enabled: enabled, results: results)
  }
  
  // Helper method to process PRF extension using hybrid implementation
  private func processPRFExtension(credentialId: Data) -> AuthenticationExtensionsPRFOutputsJSON? {
    guard let originalRequest = _originalRequest,
          let requestData = originalRequest.data(using: .utf8) else {
      return nil
    }
    
    // Log which PRF implementation is being used
    print("PRF Implementation: \(PasskeyPRF.getPRFImplementationInfo())")
    
    do {
      // Try to decode as creation request first
      if let createRequest = try? JSONDecoder().decode(RNPasskeyCredentialCreationOptions.self, from: requestData) {
        if let prfInputs = createRequest.extensions?.prf {
          let prfOutput = PasskeyPRF.processPRFExtension(
            credentialId: credentialId,
            prfInputs: prfInputs
          )
          return convertToPRFOutputsJSON(prfOutput)
        }
      }
      
      // Try to decode as assertion request
      if let getRequest = try? JSONDecoder().decode(RNPasskeyCredentialRequestOptions.self, from: requestData) {
        if let prfInputs = getRequest.extensions?.prf {
          let prfOutput = PasskeyPRF.processPRFExtension(
            credentialId: credentialId,
            prfInputs: prfInputs
          )
          return convertToPRFOutputsJSON(prfOutput)
        }
      }
    } catch {
      print("Error processing PRF extension: \(error)")
    }
    
    return nil
  }
  
  func authorizationController(
      controller: ASAuthorizationController,
      didCompleteWithError error: Error
  ) {
    // Authorization request returned an error
    _completionHandler.onError(error);
  }

  func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
    
    switch (authorization.credential) {
    case let credential as ASAuthorizationPlatformPublicKeyCredentialRegistration:
      self.handlePlatformPublicKeyRegistrationResponse(credential: credential);
      
    case let credential as ASAuthorizationSecurityKeyPublicKeyCredentialRegistration:
      self.handleSecurityKeyPublicKeyRegistrationResponse(credential: credential);
      
    case let credential as ASAuthorizationPlatformPublicKeyCredentialAssertion:
      self.handlePlatformPublicKeyAssertionResponse(credential: credential);
      
    case let credential as ASAuthorizationSecurityKeyPublicKeyCredentialAssertion:
      self.handleSecurityKeyPublicKeyAssertionResponse(credential: credential);
    default:
      _completionHandler.onError(ASAuthorizationError(ASAuthorizationError.invalidResponse));
    }
  }
  
  func handlePlatformPublicKeyRegistrationResponse(credential: ASAuthorizationPlatformPublicKeyCredentialRegistration) -> Void {
    if credential.rawAttestationObject == nil {
      _completionHandler.onError(ASAuthorizationError(ASAuthorizationError.invalidResponse));
    }
    
    var largeBlob: AuthenticationExtensionsLargeBlobOutputsJSON?;
    if #available(iOS 17.0, *) {
      if (credential.largeBlob != nil) {
        largeBlob = AuthenticationExtensionsLargeBlobOutputsJSON(
          supported: credential.largeBlob?.isSupported ?? false
        );
      }
    }
    
    // Process PRF extension - uses hybrid implementation (native iOS 17.0+ or custom fallback)
    let prfOutput = processPRFExtension(credentialId: credential.credentialID);
      
    let clientExtensionResults = AuthenticationExtensionsClientOutputsJSON(largeBlob: largeBlob, prf: prfOutput);
    
    let response =  AuthenticatorAttestationResponseJSON(
      clientDataJSON: credential.rawClientDataJSON.toBase64URLEncodedString(),
      attestationObject: credential.rawAttestationObject!.toBase64URLEncodedString()
    );
      
    let createResponse = RNPasskeyCreateResponseJSON(
        id: credential.credentialID.toBase64URLEncodedString(),
        rawId: credential.credentialID.toBase64URLEncodedString(),
        response: response,
        clientExtensionResults: clientExtensionResults
    );

    _completionHandler.onSuccess(.create(createResponse));
  }
  
  func handleSecurityKeyPublicKeyRegistrationResponse(credential: ASAuthorizationSecurityKeyPublicKeyCredentialRegistration) -> Void {
    if credential.rawAttestationObject == nil {
      _completionHandler.onError((ASAuthorizationError(ASAuthorizationError.Code.failed)));
    }
    
    var transports: [AuthenticatorTransport] = [];
    
    // Credential transports is only available on iOS 17.5+, so we need to check it here
    // If device is running <17.5, return an empty array
    if #available(iOS 17.5, *) {
      if let securityKeyCredential = credential as? ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor {
        transports = securityKeyCredential.transports.compactMap { transport in
          AuthenticatorTransport(rawValue: transport.rawValue)
        }
      }
    }
    
    // Process PRF extension - uses hybrid implementation (native iOS 17.0+ or custom fallback)
    let prfOutput = processPRFExtension(credentialId: credential.credentialID);
    
    let clientExtensionResults = AuthenticationExtensionsClientOutputsJSON(largeBlob: nil, prf: prfOutput);
     
    let response =  AuthenticatorAttestationResponseJSON(
      clientDataJSON: credential.rawClientDataJSON.toBase64URLEncodedString(),
      transports: transports, 
      attestationObject: credential.rawAttestationObject!.toBase64URLEncodedString()
    );
     
    let createResponse = RNPasskeyCreateResponseJSON(
      id: credential.credentialID.toBase64URLEncodedString(),
      rawId: credential.credentialID.toBase64URLEncodedString(),
      response: response,
      clientExtensionResults: clientExtensionResults
    );
    
    _completionHandler.onSuccess(.create(createResponse));
  }
  
  func handlePlatformPublicKeyAssertionResponse(credential: ASAuthorizationPlatformPublicKeyCredentialAssertion) -> Void {
    var largeBlob: AuthenticationExtensionsLargeBlobOutputsJSON? = AuthenticationExtensionsLargeBlobOutputsJSON()
    if #available(iOS 17.0, *), let result = credential.largeBlob?.result {
        switch (result) {
        case .read(data: let blobData):
          if let blob = blobData?.uIntArray {
            largeBlob?.blob = blob;
          }
        case .write(success: let successfullyWritten):
          largeBlob?.written = successfullyWritten;
        @unknown default: break
        }
    }
    
    // Process PRF extension - uses hybrid implementation (native iOS 17.0+ or custom fallback)
    let prfOutput = processPRFExtension(credentialId: credential.credentialID);
    
    let clientExtensionResults = AuthenticationExtensionsClientOutputsJSON(largeBlob: largeBlob, prf: prfOutput);
    let userHandle: String? = credential.userID.flatMap { String(data: $0, encoding: .utf8) };

    let response = AuthenticatorAssertionResponseJSON(
        authenticatorData: credential.rawAuthenticatorData.toBase64URLEncodedString(),
        clientDataJSON: credential.rawClientDataJSON.toBase64URLEncodedString(),
        signature: credential.signature!.toBase64URLEncodedString(),
        userHandle: userHandle
    );
    
    let getResponse = RNPasskeyGetResponseJSON(
        id: credential.credentialID.toBase64URLEncodedString(),
        rawId: credential.credentialID.toBase64URLEncodedString(),
        response: response,
        clientExtensionResults: clientExtensionResults
    );
    
    _completionHandler.onSuccess(.get(getResponse));
  }
  
  func handleSecurityKeyPublicKeyAssertionResponse(credential: ASAuthorizationSecurityKeyPublicKeyCredentialAssertion) -> Void {
    let userHandle: String? = credential.userID.flatMap { String(data: $0, encoding: .utf8) };
    
    // Process PRF extension - uses hybrid implementation (native iOS 17.0+ or custom fallback)
    let prfOutput = processPRFExtension(credentialId: credential.credentialID);
    
    let clientExtensionResults = AuthenticationExtensionsClientOutputsJSON(largeBlob: nil, prf: prfOutput);
    
    let response =  AuthenticatorAssertionResponseJSON(
      authenticatorData: credential.rawAuthenticatorData.toBase64URLEncodedString(),
      clientDataJSON: credential.rawClientDataJSON.toBase64URLEncodedString(),
      signature: credential.signature!.toBase64URLEncodedString(),
      userHandle: userHandle
    );
    
    let getResponse = RNPasskeyGetResponseJSON(
      id: credential.credentialID.toBase64URLEncodedString(),
      rawId: credential.credentialID.toBase64URLEncodedString(),
      response: response,
      clientExtensionResults: clientExtensionResults
    );
    
    _completionHandler.onSuccess(.get(getResponse));
  }
}
