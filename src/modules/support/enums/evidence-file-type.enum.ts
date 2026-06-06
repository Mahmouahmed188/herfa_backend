export enum EvidenceFileType {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  GIF = 'gif',
  WEBP = 'webp',
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
}

export const IMAGE_TYPES = [
  EvidenceFileType.JPG,
  EvidenceFileType.JPEG,
  EvidenceFileType.PNG,
  EvidenceFileType.GIF,
  EvidenceFileType.WEBP,
];

export const DOCUMENT_TYPES = [
  EvidenceFileType.PDF,
  EvidenceFileType.DOC,
  EvidenceFileType.DOCX,
];

export const ALLOWED_EVIDENCE_FILE_TYPES = [...IMAGE_TYPES, ...DOCUMENT_TYPES];

export const IMAGE_MAX_SIZE = 10 * 1024 * 1024;
export const DOCUMENT_MAX_SIZE = 25 * 1024 * 1024;
