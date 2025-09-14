import * as React from 'react';

import { StyleSheet, View, Button, TextInput, Alert } from 'react-native';
import { Passkey } from 'react-native-passkey';

import RegRequest from './testData/RegRequest.json';
import AuthRequest from './testData/AuthRequest.json';

export default function App() {
  const [email, setEmail] = React.useState('h92022566881@gmail.com');

  async function createAccount() {
    try {
      console.log('Starting Passkey registration...');
      console.log('Request data:', RegRequest);
      
      const requestJson = {
        // ...Retrieve request from server
        ...RegRequest,
      };

      const result = await Passkey.create(requestJson);

      console.log('Registration result: ', result);
      Alert.alert('Success', 'Passkey registration completed!');
    } catch (e) {
      console.log('Registration error:', e);
      Alert.alert('Error', `Registration failed: ${e.message || e}`);
    }
  }

  async function authenticateAccount() {
    try {
      console.log('Starting Passkey authentication...');
      console.log('Request data:', AuthRequest);
      
      const requestJson = {
        // ...Retrieve request from server
        ...AuthRequest,
      };

      const result = await Passkey.get(requestJson);

      console.log('Authentication result: ', result);
      Alert.alert('Success', 'Passkey authentication completed!');
    } catch (e) {
      console.log('Authentication error:', e);
      Alert.alert('Error', `Authentication failed: ${e.message || e}`);
    }
  }

  async function isSupported() {
    const result = Passkey.isSupported();
    Alert.alert(result ? 'Supported' : 'Not supported');
  }

  return (
    <View style={styles.container}>
      <TextInput placeholder="email" value={email} onChangeText={setEmail} />
      <Button title="Create Account" onPress={createAccount} />
      <Button title="Authenticate" onPress={authenticateAccount} />
      <Button title="isSupported?" onPress={isSupported} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
