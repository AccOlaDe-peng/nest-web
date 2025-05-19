import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor() {
    // 生成 RSA 密钥对
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  /**
   * 使用 RSA 公钥加密数据
   * @param data 要加密的数据
   * @returns 加密后的数据（Base64 格式）
   */
  encrypt(data: string): string {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: this.publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    return encrypted.toString('base64');
  }

  /**
   * 使用 RSA 私钥解密数据
   * @param encryptedData 加密的数据（Base64 格式）
   * @returns 解密后的原始数据
   */
  decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    return decrypted.toString('utf8');
  }

  /**
   * 获取公钥
   * @returns RSA 公钥
   */
  getPublicKey(): string {
    return this.publicKey;
  }
}
