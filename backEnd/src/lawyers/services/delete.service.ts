import { prisma } from '../../lib/prisma';

export const deleteLawyer = async (id: string) => {
  return await prisma.lawyer.delete({
    where: { id },
  });
};
