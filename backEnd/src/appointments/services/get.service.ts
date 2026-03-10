import {prisma} from '../../lib/prisma'

// Função auxiliar para formatar data como YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Função auxiliar para formatar hora como HH:mm
function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export const appointment = async (userId: string) => {
  const appointments = await prisma.appointment.findMany({
    where: {
      userId,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        }
      },
      process: {
        select: {
          id: true,
          processNumber: true,
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  })

  // Mapear para o formato esperado pelo frontend
  return appointments.map(appointment => {
    const date = new Date(appointment.date)
    
    return {
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      event_date: formatDate(date),
      event_time: formatTime(date),
      location: (appointment as any).location ?? null,
      reminder: false,
      event_type: (appointment as any).eventType ?? 'reuniao',
      client_id: appointment.clientId,
      case_id: appointment.processId,
      created_at: appointment.createdAt.toISOString(),
      updated_at: appointment.updatedAt.toISOString(),
      clients: appointment.client ? {
        name: appointment.client.name
      } : null,
      cases: appointment.process ? {
        case_number: appointment.process.processNumber
      } : null,
    }
  })
}
