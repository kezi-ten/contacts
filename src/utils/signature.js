import CryptoJS from 'crypto-js';
const SECRET_KEY = 'e8f3a7b2c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0';

export function generateSignatureWithTimestamp(data) {
  // 生成当前时间戳（秒级）
  const timestamp = Math.floor(Date.now() / 1000);
  
  // 将数据转换为字符串
  const dataStr = JSON.stringify(data);
  
  // 将数据和时间戳组合后进行签名
  const dataToSign = `${dataStr}|${timestamp}`;
  
  // 使用HMAC-SHA256算法生成签名
  const hash = CryptoJS.HmacSHA256(dataToSign, SECRET_KEY);
  const signature = hash.toString(CryptoJS.enc.Hex);
  
  return {
    signature,
    timestamp
  };
}
