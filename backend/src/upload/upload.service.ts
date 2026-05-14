import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class UploadService {
  async deleteFile(filename: string) {
    // Basic security check to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Invalid filename provided');
    }

    const filePath = join(process.cwd(), 'uploads', filename);

    try {
      await fs.stat(filePath);
    } catch (err) {
      throw new NotFoundException('File not found');
    }

    try {
      await fs.unlink(filePath);
      return { message: 'File deleted successfully', filename };
    } catch (err) {
      throw new BadRequestException('Could not delete file. It might be in use or protected.');
    }
  }
}
