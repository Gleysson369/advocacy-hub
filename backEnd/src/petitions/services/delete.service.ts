import {prisma} from '../../lib/prisma'

export const DeletePetition = async (id: string) => {
  const petition = await prisma.petition.delete({ // Updated prisma model and variable
    where: {
      id
    }
  })

  return petition // Updated return variable
}
