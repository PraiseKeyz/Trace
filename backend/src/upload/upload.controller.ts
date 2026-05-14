import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';

@Controller('upload')
// @UseGuards(JwtAuthGuard) // Uncomment this to protect the endpoint!
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept images and pdfs
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf|webp)$/)) {
        return cb(new BadRequestException('Only image files and PDFs are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not uploaded. Make sure you use the key "file" in your form-data.');
    }
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: `/api/v1/uploads/${file.filename}`, // We need to serve the uploads directory statically for this to work directly in the browser
    };
  }

  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    return this.uploadService.deleteFile(filename);
  }
}
