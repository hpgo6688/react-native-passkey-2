# PRF 加解密 Demo

这个demo展示了如何使用React Native Passkey库的PRF (Pseudo-Random Function) 功能来生成加密密钥，并对字符串进行加解密操作。

## 功能特性

- 🔐 使用PRF生成安全的加密密钥
- 🔒 基于PRF密钥的字符串加密
- 🔓 基于PRF密钥的字符串解密
- 📱 直观的用户界面
- 🛡️ 安全的密钥派生过程

## 使用方法

1. **启动应用**: 运行React Native应用
2. **进入Demo**: 点击主界面的"PRF 加解密 Demo"按钮
3. **输入文本**: 在第一个输入框中输入要加密的文本
4. **加密**: 点击"使用PRF加密"按钮
   - 系统会调用Passkey认证来获取PRF结果
   - 使用PRF结果生成加密密钥
   - 对文本进行加密并显示结果
5. **解密**: 点击"使用PRF解密"按钮
   - 使用相同的PRF密钥对加密文本进行解密
   - 显示解密后的原始文本

## 技术实现

### React Native兼容性
- 使用`charCodeAt()`和`String.fromCharCode()`替代`TextEncoder/TextDecoder`
- 完全兼容React Native环境，无需额外polyfill
- 支持Unicode字符的加密和解密

### 加密算法
- 使用简单的XOR加密算法（仅用于演示）
- 实际应用中应使用AES等更安全的加密算法

### 密钥派生
```typescript
// 使用PRF结果生成加密密钥 (React Native兼容)
static generateKeyFromPRF(prfResult: number[], salt: string = 'crypto-salt'): number[] {
  const saltBytes = this.stringToBytes(salt); // React Native兼容的字符串转字节
  const key = [];
  for (let i = 0; i < 32; i++) {
    key.push(prfResult[i] ^ saltBytes[i % saltBytes.length]);
  }
  return key;
}
```

### PRF集成
- 通过Passkey认证获取PRF结果
- PRF结果提供32字节的随机数据
- 使用salt增强密钥的安全性

## 安全注意事项

⚠️ **重要提醒**:
- 此demo使用简单的XOR加密，仅用于演示目的
- 生产环境中应使用AES-256等工业级加密算法
- PRF密钥应安全存储，避免泄露
- 建议使用更复杂的密钥派生函数（如PBKDF2）

## 文件结构

```
src/
├── CryptoDemo.tsx          # 主要的加解密demo组件
├── App.tsx                 # 主应用，集成了demo入口
└── CRYPTO_DEMO_README.md   # 此说明文档
```

## 依赖

- `react-native-passkey`: Passkey库
- `react-native`: React Native框架
- `testData/AuthRequestWithPRF.json`: PRF测试数据

## 扩展建议

1. **增强加密算法**: 实现AES加密
2. **密钥管理**: 添加密钥存储和恢复功能
3. **文件加密**: 支持文件级别的加密
4. **多用户支持**: 为不同用户生成不同的密钥
5. **密钥轮换**: 实现定期密钥更新机制
