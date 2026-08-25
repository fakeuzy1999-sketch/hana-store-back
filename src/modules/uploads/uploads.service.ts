import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

/** Carpeta dentro de Cloudinary; mantiene las fotos separadas de otros proyectos. */
const FOLDER = 'hannah-store/productos';

/**
 * Guarda las fotos de producto.
 *
 * Con credenciales de Cloudinary las sube alli y devuelve una URL absoluta:
 * el disco de Render en plan gratis es efimero y las fotos subidas desde el
 * panel desaparecian en cada despliegue o reinicio.
 *
 * Sin credenciales cae al disco local (`UPLOADS_DIR`), que es lo comodo en
 * desarrollo. La URL devuelta es entonces relativa (`/uploads/...`); el pipe
 * `media` del frontend antepone la base de la API y deja pasar tal cual las
 * absolutas, asi que ambos casos funcionan sin tocar Angular.
 */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly useCloudinary: boolean;

  constructor() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    this.useCloudinary = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

    if (this.useCloudinary) {
      cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
      });
      this.logger.log(`Fotos de producto en Cloudinary (${CLOUDINARY_CLOUD_NAME}/${FOLDER})`);
    } else {
      this.logger.warn('Sin credenciales de Cloudinary: las fotos van al disco local y no persisten en Render');
    }
  }

  async save(file: Express.Multer.File): Promise<{ url: string; size: number }> {
    const url = this.useCloudinary ? await this.toCloudinary(file) : await this.toDisk(file);
    return { url, size: file.size };
  }

  private toCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: FOLDER, resource_type: 'image' },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Cloudinary no devolvio resultado'));
          resolve(optimizada(result.secure_url));
        },
      );
      stream.end(file.buffer);
    });
  }

  private async toDisk(file: Express.Multer.File): Promise<string> {
    const dir = process.env.UPLOADS_DIR ?? 'uploads';
    const name = `${Date.now()}-${randomBytes(6).toString('hex')}${extname(file.originalname).toLowerCase()}`;
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), file.buffer);
    return `/uploads/${name}`;
  }
}

/**
 * Mete las transformaciones en la URL de entrega: Cloudinary sirve WebP o AVIF
 * segun el navegador (`f_auto`), ajusta la compresion (`q_auto`) y limita el
 * ancho a 1200 px sin recortar ni ampliar (`c_limit`). La original se conserva.
 */
function optimizada(secureUrl: string): string {
  return secureUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1200,c_limit/');
}
