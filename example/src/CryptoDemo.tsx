import * as React from 'react';
import { StyleSheet, View, TextInput, Button, Alert, Text, ScrollView } from 'react-native';
import { Passkey } from 'react-native-passkey';
import AuthRequestWithPRF from './testData/AuthRequestWithPRF.json';

// 简单的AES加密工具类
class SimpleCrypto {
  // 将字符串转换为字节数组 (React Native兼容)
  static stringToBytes(str: string): number[] {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  }

  // 将字节数组转换为字符串 (React Native兼容)
  static bytesToString(bytes: number[]): string {
    return String.fromCharCode(...bytes);
  }

  // 将字节数组转换为十六进制字符串
  static bytesToHex(bytes: number[]): string {
    return bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // 将十六进制字符串转换为字节数组
  static hexToBytes(hex: string): number[] {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  // 简单的XOR加密/解密
  static xorEncrypt(text: string, key: number[]): string {
    const textBytes = this.stringToBytes(text);
    const encryptedBytes = [];
    
    for (let i = 0; i < textBytes.length; i++) {
      encryptedBytes.push(textBytes[i] ^ key[i % key.length]);
    }
    
    return this.bytesToHex(encryptedBytes);
  }

  // 简单的XOR解密
  static xorDecrypt(encryptedHex: string, key: number[]): string {
    const encryptedBytes = this.hexToBytes(encryptedHex);
    const decryptedBytes = [];
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decryptedBytes.push(encryptedBytes[i] ^ key[i % key.length]);
    }
    
    return this.bytesToString(decryptedBytes);
  }

  // 使用PRF结果生成加密密钥
  static generateKeyFromPRF(prfResult: number[], salt: string = 'crypto-salt'): number[] {
    // 将salt转换为字节数组
    const saltBytes = this.stringToBytes(salt);
    
    // 简单的密钥派生：将PRF结果与salt进行XOR
    const key = [];
    for (let i = 0; i < 32; i++) {
      key.push(prfResult[i] ^ saltBytes[i % saltBytes.length]);
    }
    
    return key;
  }
}

export default function CryptoDemo() {
  const [plainText, setPlainText] = React.useState('Hello, World! This is a secret message.');
  const [encryptedText, setEncryptedText] = React.useState('');
  const [decryptedText, setDecryptedText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [prfKey, setPrfKey] = React.useState<number[] | null>(null);

  // 使用PRF获取加密密钥
  const getPRFKey = async (): Promise<number[]> => {
    try {
      console.log('Getting PRF key for encryption...');
      
      const requestJson = {
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
      
      if (result.clientExtensionResults?.prf?.results?.first) {
        const prfResult = result.clientExtensionResults.prf.results.first;
        console.log('PRF result for key generation:', prfResult);
        
        // 使用PRF结果生成加密密钥
        const key = SimpleCrypto.generateKeyFromPRF(prfResult, 'demo-salt');
        console.log('Generated encryption key:', key);
        
        return key;
      } else {
        throw new Error('PRF results not available');
      }
    } catch (error) {
      console.error('Error getting PRF key:', error);
      throw error;
    }
  };

  // 加密文本
  const encryptText = async () => {
    if (!plainText.trim()) {
      Alert.alert('Error', 'Please enter text to encrypt');
      return;
    }

    setIsLoading(true);
    try {
      // 获取PRF密钥
      const key = await getPRFKey();
      setPrfKey(key);
      
      // 使用密钥加密文本
      const encrypted = SimpleCrypto.xorEncrypt(plainText, key);
      setEncryptedText(encrypted);
      
      console.log('Encryption completed');
      console.log('Original text:', plainText);
      console.log('Encrypted text:', encrypted);
      
      Alert.alert('Success', 'Text encrypted successfully!');
    } catch (error: any) {
      console.error('Encryption error:', error);
      Alert.alert('Error', `Encryption failed: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 解密文本
  const decryptText = async () => {
    if (!encryptedText.trim()) {
      Alert.alert('Error', 'Please encrypt text first');
      return;
    }

    setIsLoading(true);
    try {
      let key = prfKey;
      
      // 如果没有缓存的密钥，重新获取
      if (!key) {
        key = await getPRFKey();
        setPrfKey(key);
      }
      
      // 使用密钥解密文本
      const decrypted = SimpleCrypto.xorDecrypt(encryptedText, key);
      setDecryptedText(decrypted);
      
      console.log('Decryption completed');
      console.log('Encrypted text:', encryptedText);
      console.log('Decrypted text:', decrypted);
      
      Alert.alert('Success', 'Text decrypted successfully!');
    } catch (error: any) {
      console.error('Decryption error:', error);
      Alert.alert('Error', `Decryption failed: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 清除所有数据
  const clearAll = () => {
    setPlainText('');
    setEncryptedText('');
    setDecryptedText('');
    setPrfKey(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>PRF 加解密 Demo</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. 输入要加密的文本</Text>
        <TextInput
          style={styles.textInput}
          value={plainText}
          onChangeText={setPlainText}
          placeholder="输入要加密的文本..."
          multiline
          numberOfLines={3}
        />
        <Button
          title={isLoading ? "加密中..." : "使用PRF加密"}
          onPress={encryptText}
          disabled={isLoading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. 加密结果</Text>
        <TextInput
          style={styles.textInput}
          value={encryptedText}
          onChangeText={setEncryptedText}
          placeholder="加密后的文本将显示在这里..."
          multiline
          numberOfLines={3}
        />
        <Button
          title={isLoading ? "解密中..." : "使用PRF解密"}
          onPress={decryptText}
          disabled={isLoading || !encryptedText}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. 解密结果</Text>
        <TextInput
          style={styles.textInput}
          value={decryptedText}
          placeholder="解密后的文本将显示在这里..."
          multiline
          numberOfLines={3}
          editable={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. 操作</Text>
        <Button
          title="清除所有数据"
          onPress={clearAll}
          color="#ff6b6b"
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>说明</Text>
        <Text style={styles.infoText}>
          • 此demo使用PRF (Pseudo-Random Function) 生成加密密钥{'\n'}
          • 加密算法使用简单的XOR操作（仅用于演示）{'\n'}
          • 实际应用中应使用更安全的加密算法如AES{'\n'}
          • PRF密钥通过Passkey认证过程生成，确保安全性
        </Text>
      </View>
    </ScrollView>
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
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});
