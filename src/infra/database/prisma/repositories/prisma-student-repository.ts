import { StudentRepository } from '@/domain/forum/application/repositories/Student-repository'
import { Student } from '@/domain/forum/enterprise/entities/Student'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaStudentMapper } from '../mappers/prisma-student-mapper'

@Injectable()
export class PrismaStudentsRepository extends StudentRepository {
  constructor(private prisma: PrismaService) {
    super()
  }

  async create(Student: Student): Promise<void> {
    const data = PrismaStudentMapper.toPersistence(Student)

    await this.prisma.user.create({ data })
  }

  async findByEmail(email: string): Promise<Student | null> {
    const student = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!student) return null

    return PrismaStudentMapper.toDomain(student)
  }
}
