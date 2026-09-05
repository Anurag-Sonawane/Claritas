import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if credentials are provided
if (env.CLOUDINARY_URL || (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET)) {
  if (env.CLOUDINARY_URL) {
    cloudinary.config({ url: env.CLOUDINARY_URL });
  } else {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }
}

/**
 * Determine the active storage provider.
 */
export function getActiveProvider() {
  if (env.STORAGE_PROVIDER === 'cloudinary') return 'cloudinary';
  if (env.STORAGE_PROVIDER === 'supabase') return 'supabase';
  if (env.STORAGE_PROVIDER === 'local') return 'local';

  // Auto-detection based on configured keys
  if (env.CLOUDINARY_URL || env.CLOUDINARY_CLOUD_NAME) return 'cloudinary';
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) return 'supabase';
  return 'local';
}

/**
 * Sanitize filename to prevent directory traversal or invalid characters.
 */
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Upload a file buffer to the active storage provider.
 *
 * @param {Object} params
 * @param {Buffer} params.buffer - File buffer from multer memory storage
 * @param {string} params.originalname - Original file name
 * @param {string} params.mimetype - MIME type of the file
 * @param {string} [params.folder='media'] - Target folder / category
 * @returns {Promise<{ cdnUrl: string, thumbnailUrl: string|null, size: number, provider: string, key?: string }>}
 */
export async function uploadFile({ buffer, originalname, mimetype = 'application/octet-stream', folder = 'media' }) {
  if (!buffer) {
    throw new Error('No file buffer provided for upload');
  }

  const provider = getActiveProvider();
  const cleanFolder = folder.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const safeName = sanitizeFilename(originalname || 'unnamed-file');
  const uniquePrefix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const uniqueKey = `${cleanFolder}/${uniquePrefix}-${safeName}`;
  const isImage = mimetype.startsWith('image/');
  const isVideo = mimetype.startsWith('video/');

  if (provider === 'cloudinary') {
    return new Promise((resolve, reject) => {
      const resourceType = isImage ? 'image' : (isVideo ? 'video' : 'raw');
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `claritas/${cleanFolder}`,
          resource_type: resourceType,
          public_id: `${uniquePrefix}-${path.parse(safeName).name}`,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }

          let thumbnailUrl = null;
          if (resourceType === 'image') {
            thumbnailUrl = cloudinary.url(result.public_id, {
              width: 300,
              height: 300,
              crop: 'fill',
              secure: true,
            });
          }

          resolve({
            provider: 'cloudinary',
            cdnUrl: result.secure_url,
            thumbnailUrl,
            size: result.bytes || buffer.length,
            key: result.public_id,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  if (provider === 'supabase') {
    const bucket = env.SUPABASE_BUCKET_NAME;
    const uploadEndpoint = `${env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${bucket}/${uniqueKey}`;

    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': mimetype,
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Supabase Storage upload error:', errText);
      throw new Error(`Supabase Storage upload failed: ${response.statusText} (${errText})`);
    }

    const publicUrl = `${env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${uniqueKey}`;

    return {
      provider: 'supabase',
      cdnUrl: publicUrl,
      thumbnailUrl: isImage ? publicUrl : null,
      size: buffer.length,
      key: uniqueKey,
    };
  }

  // Fallback: Local Disk Storage
  const targetDir = path.resolve(process.cwd(), env.UPLOAD_DIR, cleanFolder);
  await fs.mkdir(targetDir, { recursive: true });

  const finalFileName = `${uniquePrefix}-${safeName}`;
  const filePath = path.join(targetDir, finalFileName);
  await fs.writeFile(filePath, buffer);

  const localRelativeUrl = `/uploads/${cleanFolder}/${finalFileName}`;

  return {
    provider: 'local',
    cdnUrl: localRelativeUrl,
    thumbnailUrl: isImage ? localRelativeUrl : null,
    size: buffer.length,
    key: localRelativeUrl,
    filePath,
  };
}

/**
 * Delete a file by its URL or key if applicable.
 */
export async function deleteFile({ key, cdnUrl }) {
  const provider = getActiveProvider();

  try {
    if (provider === 'cloudinary' && key) {
      await cloudinary.uploader.destroy(key);
      return true;
    }

    if (provider === 'supabase' && key) {
      const bucket = env.SUPABASE_BUCKET_NAME;
      const deleteEndpoint = `${env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${bucket}`;
      await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefixes: [key] }),
      });
      return true;
    }

    if (provider === 'local') {
      const relativePath = key || cdnUrl;
      if (relativePath && relativePath.startsWith('/uploads/')) {
        const filePath = path.resolve(process.cwd(), relativePath.replace(/^\//, ''));
        await fs.unlink(filePath).catch(() => {});
        return true;
      }
    }
  } catch (err) {
    console.warn('File deletion warning:', err.message);
  }

  return false;
}

/**
 * Observability helper returning current storage provider metadata.
 */
export function getStorageInfo() {
  const provider = getActiveProvider();
  return {
    provider,
    configured: provider !== 'local',
    bucket: provider === 'supabase' ? env.SUPABASE_BUCKET_NAME : (provider === 'cloudinary' ? 'cloudinary' : env.UPLOAD_DIR),
  };
}
