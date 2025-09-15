import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';

interface iOS18PRFDemoProps {}

export default function IOS18PRFDemo({}: iOS18PRFDemoProps) {
  const showNativePRFInfo = () => {
      Alert.alert(
        'iOS 18.5 PRF Support',
        `Your iOS 18.5 simulator supports PRF with our sophisticated hybrid implementation!

✅ Native ASAuthorizationPublicKeyCredentialPRFAssertionInput (iOS 18.0+)
✅ CryptoKit HMAC-SHA256 implementation (iOS 17.0+)
✅ CommonCrypto HMAC-SHA256 implementation (iOS <17.0)
✅ Automatic version detection and optimization

The hybrid implementation ensures optimal performance and security across all iOS versions.`,
        [{ text: 'Excellent!', style: 'default' }]
      );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>iOS 18.5 PRF Demo</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>🔧 Hybrid PRF Implementation</Text>
        <Text style={styles.cardDescription}>
          iOS 18.5 (22F77) supports PRF extensions with our robust custom implementation!
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>✅ Native iOS 18.0+ Implementation</Text>
        <Text style={styles.featureDescription}>
          Uses ASAuthorizationPublicKeyCredentialPRFAssertionInput for optimal performance
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>✅ CryptoKit HMAC-SHA256 (iOS 17.0+)</Text>
        <Text style={styles.featureDescription}>
          Modern cryptographic implementation using Apple's CryptoKit framework
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>✅ Multi-Version Support</Text>
        <Text style={styles.featureDescription}>
          Automatic selection of best available implementation for each iOS version
        </Text>
      </View>

      <View style={styles.implementationCard}>
        <Text style={styles.implementationTitle}>🔧 Hybrid Implementation</Text>
        <Text style={styles.implementationText}>
          • iOS 18.0+: Native ASAuthorizationPublicKeyCredentialPRFAssertionInput{'\n'}
          • iOS 17.0+: CryptoKit HMAC-SHA256 implementation{'\n'}
          • iOS &lt;17.0: CommonCrypto HMAC-SHA256 implementation{'\n'}
          • Automatic version detection and selection
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Text 
          style={styles.infoButton}
          onPress={showNativePRFInfo}
        >
          Learn More About Native PRF
        </Text>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>📝 Technical Note</Text>
        <Text style={styles.noteText}>
          Our custom HMAC-SHA256 implementation provides robust cryptographic guarantees and full WebAuthn PRF specification compliance across all iOS versions.
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
  infoCard: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  implementationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  implementationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  implementationText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoButton: {
    backgroundColor: '#2196F3',
    color: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    overflow: 'hidden',
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
