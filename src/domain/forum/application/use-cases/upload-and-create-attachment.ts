import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error'
import { Attachment } from '../../enterprise/entities/attachment'
import { AttachmentRepository } from '../repositories/attachments-repository'
import { Uploader } from '../storage/uploader'

type Params = {
  fileName: string
  fileType: string
  body: Buffer
}

type Return = Either<
  InvalidAttachmentTypeError,
  {
    attachment: Attachment
  }
>

@Injectable()
export class UploadAndCreateAttachmentUseCase {
  constructor(
    private attachmentRepository: AttachmentRepository,
    private uploader: Uploader,
  ) {}

  async execute({ body, fileName, fileType }: Params): Promise<Return> {
    if (this.fileIsNotPdfOrImage(fileType)) {
      return left(new InvalidAttachmentTypeError(fileType))
    }

    const { url } = await this.uploader.upload({
      body,
      fileName,
      fileType,
    })

    const attachment = Attachment.create({
      title: fileName,
      url,
    })

    await this.attachmentRepository.create(attachment)

    return right({
      attachment,
    })
  }

  private fileIsNotPdfOrImage(fileType: string) {
    return !/^(image\/(jpeg|png))$|^application\/pdf$/.test(fileType)
  }
}
