import { prisma } from "../../lib/prisma"

interface IUpdateAppointment {
  title?: string
  description?: string | null
  date?: Date | string
  event_date?: string
  event_time?: string
  status?: string
  event_type?: string
  location?: string | null
  clientId?: string | null
  client_id?: string | null
  processId?: string | null
  case_id?: string | null
}

export const updateAppointment = async (id: string, userId: string, data: IUpdateAppointment) => {
  const existing = await prisma.appointment.findFirst({
    where: { id, userId },
    select: { id: true },
  })

  if (!existing) {
    throw new Error("Compromisso nao encontrado")
  }

  const updateData: Record<string, unknown> = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.status !== undefined) updateData.status = data.status
  if (data.event_type !== undefined) updateData.eventType = data.event_type
  if (data.location !== undefined) updateData.location = data.location

  if (data.event_date && data.event_time) {
    updateData.date = new Date(`${data.event_date}T${data.event_time}:00`)
  } else if (data.date !== undefined) {
    updateData.date = new Date(data.date)
  }

  const clientId = data.clientId ?? data.client_id
  const processId = data.processId ?? data.case_id

  if (clientId !== undefined) {
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId },
        select: { id: true },
      })
      if (!client) {
        throw new Error("Cliente nao encontrado para este usuario")
      }
    }
    updateData.clientId = clientId || null
  }

  if (processId !== undefined) {
    if (processId) {
      const process = await prisma.process.findFirst({
        where: { id: processId, userId },
        select: { id: true },
      })
      if (!process) {
        throw new Error("Processo nao encontrado para este usuario")
      }
    }
    updateData.processId = processId || null
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: updateData as any,
  })

  return appointment
}
