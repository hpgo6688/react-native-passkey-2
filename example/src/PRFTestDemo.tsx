import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Passkey } from 'react-native-passkey';

// 简单的加/解密工具（演示用，与 CryptoDemo.tsx 一致思路）
class SimpleCrypto {
  static stringToBytes(str: string): number[] {
    // React Native 兼容的 UTF-8 编码
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 0x80) {
        // ASCII 字符 (0-127)
        bytes.push(code);
      } else if (code < 0x800) {
        // 2 字节 UTF-8
        bytes.push(0xC0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3F));
      } else if (code < 0xD800 || code >= 0xE000) {
        // 3 字节 UTF-8
        bytes.push(0xE0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3F));
        bytes.push(0x80 | (code & 0x3F));
      } else {
        // 代理对 (4 字节 UTF-8)
        i++;
        const nextCode = str.charCodeAt(i);
        const fullCode = 0x10000 + (((code & 0x3FF) << 10) | (nextCode & 0x3FF));
        bytes.push(0xF0 | (fullCode >> 18));
        bytes.push(0x80 | ((fullCode >> 12) & 0x3F));
        bytes.push(0x80 | ((fullCode >> 6) & 0x3F));
        bytes.push(0x80 | (fullCode & 0x3F));
      }
    }
    console.log('📝 stringToBytes 输入:', str);
    console.log('📝 stringToBytes 输出:', bytes);
    return bytes;
  }

  static bytesToString(bytes: number[]): string {
    // React Native 兼容的 UTF-8 解码
    let result = '';
    let i = 0;
    while (i < bytes.length) {
      let code = bytes[i++];
      if (code < 0x80) {
        // ASCII 字符
        result += String.fromCharCode(code);
      } else if ((code >> 5) === 0x06) {
        // 2 字节 UTF-8
        const byte2 = bytes[i++];
        code = ((code & 0x1F) << 6) | (byte2 & 0x3F);
        result += String.fromCharCode(code);
      } else if ((code >> 4) === 0x0E) {
        // 3 字节 UTF-8
        const byte2 = bytes[i++];
        const byte3 = bytes[i++];
        code = ((code & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F);
        result += String.fromCharCode(code);
      } else if ((code >> 3) === 0x1E) {
        // 4 字节 UTF-8
        const byte2 = bytes[i++];
        const byte3 = bytes[i++];
        const byte4 = bytes[i++];
        code = ((code & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
        code -= 0x10000;
        result += String.fromCharCode(0xD800 + (code >> 10));
        result += String.fromCharCode(0xDC00 + (code & 0x3FF));
      }
    }
    console.log('📝 bytesToString 输入:', bytes);
    console.log('📝 bytesToString 输出:', result);
    return result;
  }

  static bytesToHex(bytes: number[]): string {
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  static hexToBytes(hex: string): number[] {
    const out: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      out.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return out;
  }

  // 简单 XOR（仅演示）
  static xorEncrypt(plain: string, key: number[]): string {
    const textBytes = this.stringToBytes(plain);
    const enc: number[] = [];
    for (let i = 0; i < textBytes.length; i++) {
      enc.push(textBytes[i] ^ key[i % key.length]);
    }
    return this.bytesToHex(enc);
  }

  static xorDecrypt(cipherHex: string, key: number[]): string {
    const enc = this.hexToBytes(cipherHex);
    const dec: number[] = [];
    for (let i = 0; i < enc.length; i++) {
      dec.push(enc[i] ^ key[i % key.length]);
    }
    return this.bytesToString(dec);
  }

  // 用 PRF 结果派生一个 32 字节的对称 key（演示）
  static generateKeyFromPRF(prfFirst: number[], salt: string = 'demo-salt'): number[] {
    const saltBytes = this.stringToBytes(salt);
    const key: number[] = [];
    for (let i = 0; i < 32; i++) {
      key.push(prfFirst[i % prfFirst.length] ^ saltBytes[i % saltBytes.length]);
    }
    return key;
  }
}

interface PRFTestDemoProps {}

export default function PRFTestDemo({}: PRFTestDemoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string>('');
  // 加解密演示相关
  const [plainText, setPlainText] = useState<string>('Hello, PRF! 这是需要加密的内容。');
  const [encryptedText, setEncryptedText] = useState<string>('');
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [prfKey, setPrfKey] = useState<number[] | null>(null);
  const [lastPRFFirst, setLastPRFFirst] = useState<number[] | null>(null);

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
      
      console.log('😂Registration result:', result);
      
      setTestResults(prev => prev + '✅ Passkey 创建成功!\n');
      setTestResults(prev => prev + `Credential ID: ${result.id}\n`);
      
      if (result.clientExtensionResults?.prf) {
        setTestResults(prev => prev + '✅ PRF 扩展处理成功!\n');
        setTestResults(prev => prev + `PRF Enabled: ${result.clientExtensionResults?.prf.enabled}\n`);
        
        if (result.clientExtensionResults?.prf.results) {
          const firstArr = result.clientExtensionResults?.prf.results?.first ?? [];
          console.log('Setting lastPRFFirst from registration:', firstArr.length, firstArr.slice(0, 4));
          setLastPRFFirst(firstArr);
          setTestResults(prev => prev + `PRF First Result: ${firstArr.slice(0, 8).join(',')}...\n`);
          if (result.clientExtensionResults?.prf.results?.second) {
            setTestResults(prev => prev + `PRF Second Result: ${result.clientExtensionResults?.prf.results?.second?.slice(0, 8).join(',')}...\n`);
          }
        } else {
          console.log('No PRF results in registration response');
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
      console.log("😂result", result)
      setTestResults(prev => prev + '✅ Passkey 认证成功!\n');
      setTestResults(prev => prev + `Credential ID: ${result.id}\n`);
      
      if (result.clientExtensionResults?.prf) {
        setTestResults(prev => prev + '✅ PRF 扩展处理成功!\n');
        setTestResults(prev => prev + `PRF Enabled: ${result.clientExtensionResults?.prf.enabled}\n`);
        
        if (result.clientExtensionResults?.prf.results) {
          const firstArr = result.clientExtensionResults?.prf.results?.first ?? [];
          console.log('Setting lastPRFFirst from authentication:', firstArr.length, firstArr.slice(0, 4));
          setLastPRFFirst(firstArr);
          setTestResults(prev => prev + `PRF First Result: ${firstArr.slice(0, 8).join(',')}...\n`);
          if (result.clientExtensionResults?.prf.results?.second) {
            setTestResults(prev => prev + `PRF Second Result: ${result.clientExtensionResults?.prf.results?.second?.slice(0, 8).join(',')}...\n`);
          }
        } else {
          console.log('No PRF results in authentication response');
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
    setPlainText('');
    setEncryptedText('');
    setDecryptedText('');
    setPrfKey(null);
    setLastPRFFirst(null);
  };

  // 基于最近一次 PRF 的 first 结果派生密钥
  const ensurePRFKey = async (): Promise<number[]> => {
    if (prfKey) return prfKey;
    if (!lastPRFFirst || lastPRFFirst.length === 0) {
      throw new Error('当前没有可用的 PRF 结果，请先完成一次注册或认证（带 PRF 扩展）');
    }
    const key = SimpleCrypto.generateKeyFromPRF(lastPRFFirst, 'demo-salt');
    setPrfKey(key);
    return key;
  };

  const encryptWithPRF = async () => {
    try {
      if (!plainText.trim()) {
        setTestResults(prev => prev + '⚠️ 请输入要加密的文本\n');
        return;
      }
      setIsLoading(true);
      const key = await ensurePRFKey();
      
      console.log('🔐 加密前原文:', plainText);
      console.log('🔐 原文长度:', plainText.length);
      console.log('🔐 原文字符码:', Array.from(plainText).map(c => c.charCodeAt(0)));
      console.log('🔐 PRF Key:', key.slice(0, 8), '...');
      
      const cipher = SimpleCrypto.xorEncrypt(plainText, key);
      
      console.log('🔐 加密后密文:', cipher);
      console.log('🔐 密文长度:', cipher.length);
      
      setEncryptedText(cipher);
      setTestResults(prev => prev + '🔐 已使用 PRF Key 完成加密\n');
    } catch (e: any) {
      setTestResults(prev => prev + `❌ 加密失败: ${e.message || e}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const decryptWithPRF = async () => {
    try {
      if (!encryptedText.trim()) {
        setTestResults(prev => prev + '⚠️ 请先完成加密\n');
        return;
      }
      setIsLoading(true);
      const key = await ensurePRFKey();
      
      console.log('🔓 解密前密文:', encryptedText);
      console.log('🔓 密文长度:', encryptedText.length);
      console.log('🔓 PRF Key:', key.slice(0, 8), '...');
      
      const plain = SimpleCrypto.xorDecrypt(encryptedText, key);
      
      console.log('🔓 解密后原文:', plain);
      console.log('🔓 原文长度:', plain.length);
      console.log('🔓 原文字符码:', Array.from(plain).map(c => c.charCodeAt(0)));
      
      setDecryptedText(plain);
      setTestResults(prev => prev + '🔓 已使用 PRF Key 完成解密\n');
    } catch (e: any) {
      setTestResults(prev => prev + `❌ 解密失败: ${e.message || e}\n`);
    } finally {
      setIsLoading(false);
    }
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
const encryptDisable = isLoading || (!lastPRFFirst || lastPRFFirst.length === 0)
console.log("isLoading", isLoading)
console.log("lastPRFFirst", lastPRFFirst)
console.log("lastPRFFirst.length", lastPRFFirst?.length)
console.log("encryptDisable", encryptDisable)
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

      {/* PRF 加解密测试区（参考 CryptoDemo.tsx） */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>🔐 基于 PRF 的加解密测试</Text>
        <Text style={styles.cardDescription}>
          先通过上方按钮完成一次注册或认证拿到 PRF 结果，然后在此处使用 PRF 派生的密钥进行文本加解密。
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>1) 输入要加密的文本</Text>
        <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ padding: 10 }}>{plainText}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={encryptWithPRF} 
          disabled={encryptDisable}
        >
          <Text style={styles.buttonText}>使用 PRF Key 加密 {encryptDisable + ""}</Text>
        </TouchableOpacity>

        <Text style={{ fontWeight: 'bold', marginVertical: 8 }}>2) 加密结果</Text>
        <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ padding: 10 }}>{encryptedText || '(空)'}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={decryptWithPRF}
          disabled={isLoading || !encryptedText}
        >
          <Text style={styles.buttonText}>使用 PRF Key 解密</Text>
        </TouchableOpacity>

        <Text style={{ fontWeight: 'bold', marginVertical: 8 }}>3) 解密结果</Text>
        <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ padding: 10 }}>{decryptedText || '(空)'}</Text>
        </View>
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
