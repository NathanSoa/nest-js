import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Student as DomainStudent } from '@/domain/forum/enterprise/entities/student'
import { User as PrismaUser, Prisma } from '@prisma/client'

export class PrismaStudentMapper {
  static toDomain(raw: PrismaUser): DomainStudent {
    return DomainStudent.create(
      {
        email: raw.email,
        password: raw.password,
        name: raw.name,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPersistence(
    student: DomainStudent,
  ): Prisma.UserUncheckedCreateInput {
    return {
      email: student.email,
      password: student.password,
      name: student.name,
      id: student.id.toString(),
    }
  }
}
