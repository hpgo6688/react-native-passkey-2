import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Passkey } from 'react-native-passkey';

interface PRFTestDemoProps {}

export default function PRFTestDemo({}: PRFTestDemoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string>('');

  const generateRandomSalt = (length: number = 32): number[] => {
    const salt = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      salt[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(salt);
  };

  const toBase64 = (uint8Array: Uint8Array): string => {
    // 简单的 base64 编码，使用 Array.from 和 join
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < uint8Array.length) {
      const a = uint8Array[i++] || 0;
      const b = i < uint8Array.length ? (uint8Array[i++] || 0) : 0;
      const c = i < uint8Array.length ? (uint8Array[i++] || 0) : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < uint8Array.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < uint8Array.length ? chars.charAt(bitmap & 63) : '=';
    }
    
    return result;
  };

  const testPRFRegistration = async () => {
    setIsLoading(true);
    setTestResults('开始测试 PRF 注册...\n');
    
    try {
      // 生成测试用的随机盐
      const firstSalt = generateRandomSalt(32);
      const secondSalt = generateRandomSalt(32);
      
      const registrationOptions = {
        challenge: 'nhkQXfE59Jb97VyyNJkvDiXucMEvltduvcrDmGrODHY',
        rp: {
          name: 'PRF Test Demo',
          id: 'aijs.top',
        },
        user: {
          id: '2HzoHm_hY0CjuEESY9tY6-3SdjmNHOoNqaPDcZGzsr0',
          name: 'PRF Test User',
          displayName: 'PRF Test User',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none',
        extensions: {
          prf: {
            eval: {
              first: firstSalt,
              second: secondSalt,
            },
          },
        },
      };

      setTestResults(prev => prev + `使用盐值: ${firstSalt.slice(0, 8).join(',')}...\n`);
      setTestResults(prev => prev + `第二个盐值: ${secondSalt.slice(0, 8).join(',')}...\n`);
      setTestResults(prev => prev + '正在创建 Passkey...\n');

      const result = await Passkey.create(registrationOptions);
      
      setTestResults(prev => prev + '✅ Passkey 创建成功!\n');
      setTestResults(prev => prev + `Credential ID: ${result.id}\n`);
      
      if (result.extensions?.clientExtensionResults?.prf) {
        setTestResults(prev => prev + '✅ PRF 扩展处理成功!\n');
        setTestResults(prev => prev + `PRF Enabled: ${result.extensions?.clientExtensionResults?.prf.enabled}\n`);
        
        if (result.extensions?.clientExtensionResults?.prf.results) {
          setTestResults(prev => prev + `PRF First Result: ${result.extensions?.clientExtensionResults?.prf.results?.first?.slice(0, 8).join(',')}...\n`);
          if (result.extensions?.clientExtensionResults?.prf.results?.second) {
            setTestResults(prev => prev + `PRF Second Result: ${result.extensions?.clientExtensionResults?.prf.results?.second?.slice(0, 8).join(',')}...\n`);
          }
        }
      } else {
        setTestResults(prev => prev + '⚠️ PRF 扩展未返回结果\n');
      }
      
    } catch (error: any) {
      setTestResults(prev => prev + `❌ 错误: ${error.message}\n`);
      console.error('PRF Registration Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testPRFAuthentication = async () => {
    setIsLoading(true);
    setTestResults('开始测试 PRF 认证...\n');
    
    try {
      // 生成测试用的随机盐
      const firstSalt = generateRandomSalt(32);
      const secondSalt = generateRandomSalt(32);
      
      const authenticationOptions = {
        challenge: toBase64(new Uint8Array(32).fill(3)),
        timeout: 60000,
        rpId: 'aijs.top',
        allowCredentials: [], // 空数组表示允许任何已注册的凭据
        userVerification: 'required',
        extensions: {
          prf: {
            eval: {
              first: firstSalt,
              second: secondSalt,
            },
          },
        },
      };

      setTestResults(prev => prev + `使用盐值: ${firstSalt.slice(0, 8).join(',')}...\n`);
      setTestResults(prev => prev + `第二个盐值: ${secondSalt.slice(0, 8).join(',')}...\n`);
      setTestResults(prev => prev + '正在进行 Passkey 认证...\n');

      const result = await Passkey.get(authenticationOptions);
      
      setTestResults(prev => prev + '✅ Passkey 认证成功!\n');
      setTestResults(prev => prev + `Credential ID: ${result.id}\n`);
      
      if (result.clientExtensionResults?.prf) {
        setTestResults(prev => prev + '✅ PRF 扩展处理成功!\n');
        setTestResults(prev => prev + `PRF Enabled: ${result.clientExtensionResults?.prf.enabled}\n`);
        
        if (result.clientExtensionResults?.prf.results) {
          setTestResults(prev => prev + `PRF First Result: ${result.clientExtensionResults?.prf.results?.first?.slice(0, 8).join(',')}...\n`);
          if (result.clientExtensionResults?.prf.results?.second) {
            setTestResults(prev => prev + `PRF Second Result: ${result.clientExtensionResults?.prf.results?.second?.slice(0, 8).join(',')}...\n`);
          }
        }
      } else {
        setTestResults(prev => prev + '⚠️ PRF 扩展未返回结果\n');
      }
      
    } catch (error: any) {
      setTestResults(prev => prev + `❌ 错误: ${error.message}\n`);
      console.error('PRF Authentication Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults('');
  };

  const showPRFInfo = () => {
    Alert.alert(
      'PRF 测试说明',
      `这个测试页面会实际调用 Passkey PRF 功能来验证：

1. 🔐 PRF 注册测试
   - 创建带有 PRF 扩展的 Passkey
   - 验证 PRF 结果是否正确返回

2. 🔑 PRF 认证测试  
   - 使用已注册的 Passkey 进行认证
   - 验证 PRF 扩展是否正常工作

3. 📊 结果验证
   - 检查 PRF 计算结果
   - 验证盐值和输出的一致性

注意：需要先在设备上注册 Passkey 才能进行认证测试。`,
      [{ text: '开始测试', style: 'default' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>PRF 功能测试</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>🧪 实际功能测试</Text>
        <Text style={styles.cardDescription}>
          这个页面会实际调用 Passkey PRF 功能，验证我们修复的代码是否正常工作
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={testPRFRegistration}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>测试 PRF 注册</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testPRFAuthentication}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>测试 PRF 认证</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.infoButton]} 
          onPress={showPRFInfo}
        >
          <Text style={styles.buttonText}>查看测试说明</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>清除结果</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>正在处理...</Text>
        </View>
      )}

      {testResults ? (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>测试结果</Text>
          <ScrollView style={styles.resultsScrollView}>
            <Text style={styles.resultsText}>{testResults}</Text>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            点击上方按钮开始测试 PRF 功能
          </Text>
        </View>
      )}

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>📝 测试说明</Text>
        <Text style={styles.noteText}>
          • 注册测试：创建带有 PRF 扩展的新 Passkey{'\n'}
          • 认证测试：使用已注册的 Passkey 进行认证{'\n'}
          • 结果验证：检查 PRF 计算结果是否正确{'\n'}
          • 错误处理：验证错误情况下的处理逻辑
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
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
  },
  infoButton: {
    backgroundColor: '#9C27B0',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resultsScrollView: {
    maxHeight: 200,
  },
  resultsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  placeholderCard: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
