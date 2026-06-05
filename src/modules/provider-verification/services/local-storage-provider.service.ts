import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { StorageProvider } from '../../../common/interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir = './uploads';

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getMulterOptions() {
    return {
      storage: diskStorage({
        destination: this.uploadDir,
        filename: (_req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i)) {
          return cb(new BadRequestException('Only image and pdf files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    };
  }

  async upload(file: Express.Multer.File): Promise<string> {
    return `/uploads/${file.filename}`;
  }

  async delete(path: string): Promise<void> {
    const fullPath = join(this.uploadDir, path.replace('/uploads/', ''));
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }

  getUrl(path: string): string {
    return path;
  }
}
