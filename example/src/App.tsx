import * as React from 'react';

import { StyleSheet, View, Button, TextInput, Alert, SafeAreaView } from 'react-native';
import { Passkey } from 'react-native-passkey';

import RegRequest from './testData/RegRequest.json';
import AuthRequest from './testData/AuthRequest.json';
import RegRequestWithPRF from './testData/RegRequestWithPRF.json';
import AuthRequestWithPRF from './testData/AuthRequestWithPRF.json';
import CryptoDemo from './CryptoDemo';
import PRFImplementationInfo from './PRFImplementationInfo';
import IOS18PRFDemo from './iOS18PRFDemo';
import AdvancedPRFDemo from './AdvancedPRFDemo';
import PRFTestDemo from './PRFTestDemo';

export default function App() {
  const [email, setEmail] = React.useState('h92022566883@gmail.com');
  const [showCryptoDemo, setShowCryptoDemo] = React.useState(false);
  const [showPRFInfo, setShowPRFInfo] = React.useState(false);
  const [showiOS18Demo, setShowiOS18Demo] = React.useState(false);
  const [showAdvancedDemo, setShowAdvancedDemo] = React.useState(false);
  const [showPRFTest, setShowPRFTest] = React.useState(false);

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
    } catch (e: any) {
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
    } catch (e: any) {
      console.log('Authentication error:', e);
      Alert.alert('Error', `Authentication failed: ${e.message || e}`);
    }
  }

  async function createAccountWithPRF() {
    try {
      console.log('Starting Passkey registration with PRF...');
      console.log('Request data:', RegRequestWithPRF);
      
      const requestJson = {
        // ...Retrieve request from server
        ...RegRequestWithPRF,
        extensions: {
          prf: {
            eval: {
              first: Array.from(RegRequestWithPRF.extensions.prf.eval.first),
              second: Array.from(RegRequestWithPRF.extensions.prf.eval.second)
            }
          }
        }
      };

      const result = await Passkey.create(requestJson);

      console.log('Registration with PRF result: ', result);
      console.log('Full result structure:', JSON.stringify(result, null, 2));
      
      // PRF结果在extensions.clientExtensionResults中
      console.log('Client extension results:', result.extensions?.clientExtensionResults);
      console.log('PRF results:', result.extensions?.clientExtensionResults?.prf);
      
      // 输出PRF结果的详细信息
      if (result.extensions?.clientExtensionResults?.prf) {
        console.log('PRF enabled:', result.extensions.clientExtensionResults.prf.enabled);
        console.log('PRF results data:', result.extensions.clientExtensionResults.prf.results);
        
        if (result.extensions.clientExtensionResults.prf.results) {
          console.log('PRF first result:', result.extensions.clientExtensionResults.prf.results.first);
          console.log('PRF second result:', result.extensions.clientExtensionResults.prf.results.second);
        }
      } else {
        console.log('PRF results not found in clientExtensionResults');
      }
      
      Alert.alert('Success', 'Passkey registration with PRF completed!');
    } catch (e: any) {
      console.log('Registration with PRF error:', e);
      Alert.alert('Error', `Registration with PRF failed: ${e.message || e}`);
    }
  }

  async function authenticateAccountWithPRF() {
    try {
      console.log('Starting Passkey authentication with PRF...');
      console.log('Request data:', AuthRequestWithPRF);
      
      const requestJson = {
        // ...Retrieve request from server
        ...AuthRequestWithPRF,
        extensions: {
          prf: {
            eval: {
              first: Array.from(AuthRequestWithPRF.extensions.prf.eval.first),
              second: Array.from(AuthRequestWithPRF.extensions.prf.eval.second)
            }
          }
        }
      };

      const result = await Passkey.get(requestJson);

      console.log('Authentication with PRF result: ', result);
      console.log('Full result structure:', JSON.stringify(result, null, 2));
      
      // 输出PRF结果的详细信息
      if (result.clientExtensionResults?.prf) {
        console.log('PRF enabled:', result.clientExtensionResults.prf.enabled);
        console.log('PRF results data:', result.clientExtensionResults.prf.results);
        
        if (result.clientExtensionResults.prf.results) {
          console.log('PRF first result:', result.clientExtensionResults.prf.results.first);
          console.log('PRF second result:', result.clientExtensionResults.prf.results.second);
        }
      } else {
        console.log('PRF results not found in clientExtensionResults');
      }
      
      Alert.alert('Success', 'Passkey authentication with PRF completed!');
    } catch (e: any) {
      console.log('Authentication with PRF error:', e);
      Alert.alert('Error', `Authentication with PRF failed: ${e.message || e}`);
    }
  }

  async function isSupported() {
    const result = Passkey.isSupported();
    Alert.alert(result ? 'Supported' : 'Not supported');
  }

  if (showCryptoDemo) {
    return (
      <View style={styles.container}>
        <Button 
          title="← 返回主菜单" 
          onPress={() => setShowCryptoDemo(false)}
          color="#666"
        />
        <CryptoDemo />
      </View>
    );
  }

  if (showPRFInfo) {
    return (
      <View style={styles.container}>
        <Button 
          title="← 返回主菜单" 
          onPress={() => setShowPRFInfo(false)}
          color="#666"
        />
        <PRFImplementationInfo />
      </View>
    );
  }

  if (showiOS18Demo) {
    return (
      <View style={styles.container}>
        <Button 
          title="← 返回主菜单" 
          onPress={() => setShowiOS18Demo(false)}
          color="#666"
        />
        <IOS18PRFDemo />
      </View>
    );
  }

  if (showAdvancedDemo) {
    return (
      <View style={styles.container}>
        <Button 
          title="← 返回主菜单" 
          onPress={() => setShowAdvancedDemo(false)}
          color="#666"
        />
        <AdvancedPRFDemo />
      </View>
    );
  }

  if (showPRFTest) {
    return (
      <View style={styles.container}>
        <Button 
          title="← 返回主菜单" 
          onPress={() => setShowPRFTest(false)}
          color="#666"
        />
        <PRFTestDemo />
      </View>
    );
  }

  return (
      <View style={styles.container}>
        <TextInput placeholder="email" value={email} onChangeText={setEmail} />
        <Button title="Create Account" onPress={createAccount} />
        <Button title="Authenticate" onPress={authenticateAccount} />
        <Button title="Create Account with PRF" onPress={createAccountWithPRF} />
        <Button title="Authenticate with PRF" onPress={authenticateAccountWithPRF} />
        <Button title="isSupported?" onPress={isSupported} />
        <Button 
          title="PRF 加解密 Demo" 
          onPress={() => setShowCryptoDemo(true)}
          color="#4CAF50"
        />
        <Button 
          title="PRF Implementation Info" 
          onPress={() => setShowPRFInfo(true)}
          color="#2196F3"
        />
        <Button 
          title="iOS 18.5 PRF Demo" 
          onPress={() => setShowiOS18Demo(true)}
          color="#FF9800"
        />
        <Button 
          title="Advanced PRF Demo" 
          onPress={() => setShowAdvancedDemo(true)}
          color="#9C27B0"
        />
        <Button 
          title="🧪 PRF 功能测试" 
          onPress={() => setShowPRFTest(true)}
          color="#E91E63"
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'space-evenly',
    paddingTop: 80,
    gap: 10
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
