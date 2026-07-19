import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit, { toFile } from '@imagekit/nodejs';

import { PrismaService } from '../../database/prisma.service';

type ImageKitUploadResult = ImageKit.FileUploadResponse;

@Injectable()
export class UploadsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async uploadImage(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image file is required.');
    if (!file.mimetype.startsWith('image/'))
      throw new BadRequestException('Only image uploads are allowed.');

    const folder =
      this.configService.get<string>('IMAGEKIT_UPLOAD_FOLDER') ?? '/bgb';
    const result = await this.uploadToImageKit(file, folder);

    return this.prisma.uploadAsset.create({
      data: {
        url: this.resolveUrl(result),
        publicId: result.fileId,
        folder,
        width: result.width,
        height: result.height,
        format: this.resolveFormat(result, file.originalname),
        bytes: result.size ?? file.size,
      },
    });
  }

  private async uploadToImageKit(
    file: Express.Multer.File,
    folder: string,
  ): Promise<ImageKitUploadResult> {
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');

    if (!privateKey) {
      throw new ServiceUnavailableException(
        'ImageKit credentials are not configured.',
      );
    }

    const client = new ImageKit({ privateKey });
    const uploadable = await toFile(file.buffer, file.originalname, {
      type: file.mimetype,
    });

    return client.files.upload({
      file: uploadable,
      fileName: this.safeFileName(file.originalname),
      folder,
      useUniqueFileName: true,
      tags: ['bgb'],
    });
  }

  private resolveUrl(result: ImageKitUploadResult) {
    if (result.url) return result.url;

    const urlEndpoint = this.configService
      .get<string>('IMAGEKIT_URL_ENDPOINT')
      ?.replace(/\/$/, '');
    if (urlEndpoint && result.filePath)
      return `${urlEndpoint}${result.filePath}`;

    throw new ServiceUnavailableException(
      'ImageKit upload succeeded without a usable file URL.',
    );
  }

  private resolveFormat(result: ImageKitUploadResult, originalName: string) {
    const extension = originalName.split('.').pop();
    if (extension) return extension.toLowerCase();
    return result.fileType;
  }

  private safeFileName(filename: string) {
    return filename.trim().replace(/[^a-zA-Z0-9.-]/g, '_');
  }
}
