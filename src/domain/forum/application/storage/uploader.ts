type Return = {
  url: string
}

export type UploadParams = {
  fileName: string
  fileType: string
  body: Buffer
}

export abstract class Uploader {
  abstract upload(params: UploadParams): Promise<Return>
}
