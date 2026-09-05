import zlib from 'node:zlib';
import AdmZip from 'adm-zip';

/**
 * Extract file text from a ZIP buffer using native PKZIP parsing and zlib.
 * Guaranteed cross-platform and immune to cross-realm VM instanceof issues.
 */
function extractTextFromZip(buffer, targetName) {
  if (!buffer || buffer.length < 30) return null;
  const targetLower = targetName.toLowerCase();
  let offset = 0;

  while (offset + 30 < buffer.length) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) {
      break;
    }

    const compressionMethod = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraFieldLength = buffer.readUInt16LE(offset + 28);

    const fileNameStart = offset + 30;
    const fileName = buffer.slice(fileNameStart, fileNameStart + fileNameLength).toString('utf8');
    const dataStart = fileNameStart + fileNameLength + extraFieldLength;
    const compressedData = buffer.slice(dataStart, dataStart + compressedSize);

    const fileNameClean = fileName.toLowerCase().replace(/\\/g, '/');
    if (fileNameClean === targetLower || fileNameClean.endsWith('/' + targetLower)) {
      if (compressionMethod === 0) {
        return compressedData.toString('utf8');
      } else if (compressionMethod === 8) {
        try {
          return zlib.inflateRawSync(compressedData).toString('utf8');
        } catch {
          try {
            return zlib.inflateSync(compressedData).toString('utf8');
          } catch {
            return null;
          }
        }
      }
    }

    offset = dataStart + compressedSize;
  }

  return null;
}

/**
 * List file entry names from a ZIP buffer using native PKZIP parsing.
 */
function listZipFileNames(buffer) {
  const entries = [];
  if (!buffer || buffer.length < 30) return entries;
  let offset = 0;

  while (offset + 30 < buffer.length) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) {
      break;
    }

    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraFieldLength = buffer.readUInt16LE(offset + 28);

    const fileNameStart = offset + 30;
    const fileName = buffer.slice(fileNameStart, fileNameStart + fileNameLength).toString('utf8');
    entries.push(fileName);

    offset = fileNameStart + fileNameLength + extraFieldLength + compressedSize;
  }

  return entries;
}

/**
 * Validates and inspects an uploaded SCORM/xAPI zip package.
 *
 * @param {Buffer} buffer - In-memory zip package buffer
 * @param {string} originalFileName - Original filename of the upload
 * @returns {{ valid: boolean, title: string, version: string, type: string, scoCount: number, launchFile: string|null, errors: Array<{code: string, message: string, path?: string}>, warnings: Array<{code: string, message: string}> }}
 */
export function validateScormZip(buffer, originalFileName = 'package.zip') {
  const fallbackTitle = originalFileName.replace(/\.zip$/i, '');

  if (!buffer || buffer.length < 22) {
    return {
      valid: false,
      title: fallbackTitle,
      version: 'Unknown',
      type: 'Empty Archive',
      scoCount: 0,
      launchFile: null,
      errors: [{
        code: 'EMPTY_ARCHIVE',
        message: 'The uploaded zip file is empty or corrupted.',
        path: originalFileName
      }],
      warnings: []
    };
  }

  // Quick check for zip magic signature
  const isZip = buffer.readUInt32LE(0) === 0x04034b50;
  if (!isZip) {
    return {
      valid: false,
      title: fallbackTitle,
      version: 'Unknown',
      type: 'Invalid Archive',
      scoCount: 0,
      launchFile: null,
      errors: [{
        code: 'CORRUPT_ARCHIVE',
        message: 'The uploaded file is not a valid zip archive.',
        path: originalFileName
      }],
      warnings: []
    };
  }

  try {
    // 1. First attempt native manifest extraction
    let xmlContent = extractTextFromZip(buffer, 'imsmanifest.xml');
    let entryNames = listZipFileNames(buffer);

    // 2. Fallback to adm-zip if native parser did not find it
    if (!xmlContent) {
      try {
        const zip = new AdmZip(buffer);
        xmlContent = zip.readAsText('imsmanifest.xml');
        if (!entryNames.length) {
          entryNames = (zip.getEntries() || []).map(e => e.entryName);
        }
      } catch {
        // Fallback adm-zip error ignored
      }
    }

    if (!xmlContent) {
      return {
        valid: false,
        title: fallbackTitle,
        version: 'Unknown',
        type: 'Non-SCORM Archive',
        scoCount: 0,
        launchFile: null,
        errors: [{
          code: 'MISSING_MANIFEST',
          message: 'Required manifest file "imsmanifest.xml" was not found in the root of the zip package.',
          path: 'imsmanifest.xml'
        }],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Extract package title
    let title = fallbackTitle;
    const titleMatch = xmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]?.trim()) {
      title = titleMatch[1].trim();
    }

    // Extract Schema & SchemaVersion
    let version = '2004 4th Edition';
    let type = 'SCORM 2004';

    const schemaVersionMatch = xmlContent.match(/<schemaversion[^>]*>([^<]+)<\/schemaversion>/i);
    if (schemaVersionMatch && schemaVersionMatch[1]?.trim()) {
      const verString = schemaVersionMatch[1].trim();
      version = verString;
      if (verString.includes('1.2')) {
        type = 'SCORM 1.2';
      } else if (verString.includes('2004') || verString.includes('CAM 1.3')) {
        type = 'SCORM 2004';
      }
    } else {
      warnings.push({
        code: 'MISSING_SCHEMAVERSION',
        message: 'Manifest does not declare an explicit <schemaversion>. Defaulting to SCORM 2004.'
      });
    }

    // Count SCOs (Sharable Content Objects)
    let scoCount = 0;
    const scoMatches = xmlContent.match(/adlcp:scormType\s*=\s*["']sco["']/gi);
    if (scoMatches) {
      scoCount = scoMatches.length;
    } else {
      // Fallback: count items within organizations
      const itemMatches = xmlContent.match(/<item\b[^>]*>/gi);
      scoCount = itemMatches ? itemMatches.length : 1;
    }

    // Extract Primary Launch File
    let launchFile = null;
    const hrefMatch = xmlContent.match(/<resource[^>]*\bhref\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) {
      launchFile = hrefMatch[1].trim();

      // Verify launch file exists in archive
      const fileExists = entryNames.some(name => {
        const pathClean = name.replace(/\\/g, '/');
        return pathClean.endsWith(launchFile) || pathClean === launchFile;
      });

      if (!fileExists) {
        warnings.push({
          code: 'UNVERIFIED_LAUNCH_FILE',
          message: `Launch file "${launchFile}" was referenced in manifest but not found in zip structure.`
        });
      }
    }

    return {
      valid: true,
      title,
      version,
      type,
      scoCount: Math.max(1, scoCount),
      launchFile,
      errors,
      warnings
    };
  } catch (err) {
    return {
      valid: false,
      title: fallbackTitle,
      version: 'Unknown',
      type: 'Corrupt Archive',
      scoCount: 0,
      launchFile: null,
      errors: [{
        code: 'PARSE_ERROR',
        message: `Failed to inspect zip package: ${err.message}`,
        path: originalFileName
      }],
      warnings: []
    };
  }
}
