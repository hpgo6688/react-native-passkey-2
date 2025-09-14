import React from 'react';
import { View, Text, StyleSheet, Alert,SafeAreaView } from 'react-native';
import { NativeModules } from 'react-native';

interface PRFImplementationInfoProps {}
  
export default function PRFImplementationInfo({}: PRFImplementationInfoProps) {
  const getPRFImplementationInfo = async () => {
    try {
      // This would need to be exposed through the native module
      // For now, we'll show a placeholder implementation
      const info = "Hybrid PRF Implementation";
      
      Alert.alert(
        'PRF Implementation Info',
        `${info}\n\n• iOS 18.0+: Native ASAuthorizationPublicKeyCredentialPRFAssertionInput\n• iOS 17.0+: CryptoKit HMAC-SHA256 implementation\n• iOS <17.0: CommonCrypto HMAC-SHA256 implementation\n• Android: Not supported`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error getting PRF implementation info:', error);
      Alert.alert('Error', 'Failed to get PRF implementation info');
    }
  };

  return (
     <View style={styles.container}>
      <Text style={styles.title}>PRF Implementation Info</Text>
      
      <Text style={styles.description}>
        The PRF extension uses a hybrid implementation approach:
      </Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoItem}>• iOS 18.0+: Native ASAuthorizationPublicKeyCredentialPRFAssertionInput</Text>
        <Text style={styles.infoItem}>• iOS 17.0+: CryptoKit HMAC-SHA256 implementation</Text>
        <Text style={styles.infoItem}>• iOS &lt;17.0: CommonCrypto HMAC-SHA256 implementation</Text>
        <Text style={styles.infoItem}>• Android: Not supported</Text>
      </View>
      
      <Text style={styles.note}>
        The system automatically selects the appropriate implementation based on the iOS version.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    fontSize: 14,
    marginBottom: 8,
    color: '#444',
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
  },
});
