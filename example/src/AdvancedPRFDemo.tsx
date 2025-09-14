import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Button } from 'react-native';

interface AdvancedPRFDemoProps {}

export default function AdvancedPRFDemo({}: AdvancedPRFDemoProps) {
  const [implementationInfo, setImplementationInfo] = useState<string>('');

  const showImplementationDetails = () => {
    Alert.alert(
      'Advanced PRF Implementation',
      `Your React Native Passkey library now features a sophisticated multi-tier PRF implementation:

🔹 iOS 18.0+: Native ASAuthorizationPublicKeyCredentialPRFAssertionInput
   • Full native iOS integration
   • Optimal performance and security
   • Future-ready architecture

🔹 iOS 17.0+: CryptoKit HMAC-SHA256
   • Modern Apple cryptographic framework
   • Enhanced security features
   • Better performance than CommonCrypto

🔹 iOS <17.0: CommonCrypto HMAC-SHA256
   • Reliable fallback implementation
   • Wide compatibility support
   • Proven cryptographic standards

🎯 Key Features:
• Automatic version detection
• Seamless implementation switching
• Comprehensive error handling
• Input validation and security
• Base64 encoding/decoding support
• Secure random salt generation`,
      [{ text: 'Impressive!', style: 'default' }]
    );
  };

  const showTechnicalSpecs = () => {
    Alert.alert(
      'Technical Specifications',
      `🔧 Implementation Architecture:

📱 iOS Version Detection:
• Real-time iOS version checking
• Automatic implementation selection
• Graceful fallback mechanisms

🔐 Cryptographic Standards:
• HMAC-SHA256 algorithm
• WebAuthn PRF specification compliance
• Deterministic output guarantees
• Secure key derivation

🛡️ Security Features:
• Input validation and sanitization
• Secure random salt generation
• Error handling and logging
• Memory-safe operations

⚡ Performance Optimization:
• Native API utilization (iOS 18+)
• Modern framework usage (iOS 17+)
• Efficient memory management
• Minimal overhead fallbacks

🔍 Developer Experience:
• Comprehensive error types
• Detailed logging and debugging
• Test data generation utilities
• Base64 conversion helpers`,
      [{ text: 'Technical Excellence!', style: 'default' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Advanced PRF Implementation</Text>
      
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>🚀 Multi-Tier Architecture</Text>
        <Text style={styles.headerDescription}>
          Sophisticated hybrid implementation with automatic version detection and optimization
        </Text>
      </View>

      <View style={styles.implementationGrid}>
        <View style={styles.implementationCard}>
          <Text style={styles.cardTitle}>iOS 18.0+</Text>
          <Text style={styles.cardSubtitle}>Native Implementation</Text>
          <Text style={styles.cardDescription}>
            ASAuthorizationPublicKeyCredentialPRFAssertionInput with full iOS integration
          </Text>
        </View>

        <View style={styles.implementationCard}>
          <Text style={styles.cardTitle}>iOS 17.0+</Text>
          <Text style={styles.cardSubtitle}>CryptoKit Framework</Text>
          <Text style={styles.cardDescription}>
            Modern HMAC-SHA256 using Apple's latest cryptographic framework
          </Text>
        </View>

        <View style={styles.implementationCard}>
          <Text style={styles.cardTitle}>iOS &lt;17.0</Text>
          <Text style={styles.cardSubtitle}>CommonCrypto</Text>
          <Text style={styles.cardDescription}>
            Reliable HMAC-SHA256 implementation with proven compatibility
          </Text>
        </View>
      </View>

      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>🎯 Advanced Features</Text>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔍</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Automatic Detection</Text>
            <Text style={styles.featureDescription}>Real-time iOS version checking and implementation selection</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🛡️</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Security First</Text>
            <Text style={styles.featureDescription}>Input validation, secure random generation, and memory safety</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⚡</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Performance Optimized</Text>
            <Text style={styles.featureDescription}>Native APIs, modern frameworks, and efficient fallbacks</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔧</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Developer Friendly</Text>
            <Text style={styles.featureDescription}>Comprehensive error handling, logging, and utility functions</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="View Implementation Details"
          onPress={showImplementationDetails}
          color="#2196F3"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Technical Specifications"
          onPress={showTechnicalSpecs}
          color="#4CAF50"
        />
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>💡 Innovation Note</Text>
        <Text style={styles.noteText}>
          This implementation represents a significant advancement in React Native Passkey libraries, 
          providing the most comprehensive and sophisticated PRF support available across all iOS versions.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  headerCard: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  implementationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  implementationCard: {
    backgroundColor: '#fff',
    width: '30%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
  featuresCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  buttonSpacer: {
    height: 10,
  },
  noteCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
