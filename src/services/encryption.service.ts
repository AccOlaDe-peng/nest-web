import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private publicKey: string;
  private privateKey: string;
  private readonly keysDir = path.join(process.cwd(), 'keys');
  private readonly publicKeyPath = path.join(this.keysDir, 'public.pem');
  private readonly privateKeyPath = path.join(this.keysDir, 'private.pem');

  constructor() {
    this.loadOrGenerateKeyPair();
  }

  /**
   * 加载现有密钥对或生成新的RSA密钥对
   */
  private loadOrGenerateKeyPair(): void {
    try {
      // 确保目录存在
      if (!fs.existsSync(this.keysDir)) {
        fs.mkdirSync(this.keysDir, { recursive: true });
      }

      // 检查是否已存在密钥文件
      if (
        fs.existsSync(this.publicKeyPath) &&
        fs.existsSync(this.privateKeyPath)
      ) {
        // 从文件加载现有密钥
        this.publicKey = fs.readFileSync(this.publicKeyPath, 'utf8');
        this.privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
        this.logger.log('已从文件加载现有RSA密钥对');
      } else {
        // 生成新的密钥对并保存到文件
        this.generateKeyPair(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.logger.error(`加载密钥失败: ${errorMessage}`);
      // 出错时生成新密钥但不保存到文件
      this.generateKeyPair(false);
    }
  }

  /**
   * 生成新的RSA密钥对
   * @param saveToFile 是否将密钥对保存到文件
   */
  generateKeyPair(saveToFile = true): void {
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
    this.logger.log('已成功生成新的RSA密钥对');

    // 将密钥保存到文件
    if (saveToFile) {
      try {
        // 确保目录存在
        if (!fs.existsSync(this.keysDir)) {
          fs.mkdirSync(this.keysDir, { recursive: true });
        }

        fs.writeFileSync(this.publicKeyPath, publicKey, { mode: 0o600 });
        fs.writeFileSync(this.privateKeyPath, privateKey, { mode: 0o600 });
        this.logger.log('已将RSA密钥对保存到文件');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        this.logger.error(`保存密钥到文件失败: ${errorMessage}`);
      }
    }
  }

  /**
   * 使用 RSA 公钥加密数据
   * @param data 要加密的数据
   * @returns 加密后的数据（Base64 格式）
   */
  encrypt(data: string): string {
    try {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.logger.error(`加密失败: ${errorMessage}`);
      throw new Error(`加密失败: ${errorMessage}`);
    }
  }

  /**
   * 获取用于前端加密的公钥信息
   * 包括完整的公钥和填充模式
   */
  getPublicKeyInfo(): { key: string; padding: string; oaepHash: string } {
    return {
      key: this.publicKey,
      padding: 'RSA_PKCS1_OAEP_PADDING', // 告知前端使用OAEP填充
      oaepHash: 'sha256', // 使用sha256哈希算法
    };
  }

  /**
   * 使用 RSA 私钥解密数据
   * @param encryptedData 加密的数据（Base64 格式）
   * @returns 解密后的原始数据
   */
  decrypt(encryptedData: string): string {
    try {
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
    } catch (error) {
      // 记录详细错误信息
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.logger.error(`解密失败: ${errorMessage}`);
      // 对于解密失败的情况，返回一个占位符而不是抛出异常
      // 这样可以避免在验证密码时暴露敏感信息
      return '******';
    }
  }

  /**
   * 获取公钥
   * @returns RSA 公钥
   */
  getPublicKey(): string {
    return this.publicKey;
  }
}
