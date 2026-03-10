import { prisma } from "../../lib/prisma";

export const deleteService = async (id: string) => {
  try {
    const process = await prisma.process.delete({
      where: { id }
    });

    return process;

  } catch (error: any) {
    throw new Error("Processo não encontrado ou já foi deletado.");
  }
};
