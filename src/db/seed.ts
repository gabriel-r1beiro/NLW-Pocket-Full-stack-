import { client, db } from '.'
import { goalCompletions, goals } from './schema'
import dayjs from 'dayjs'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: 'Acorda cedo', desiredWeekFrequency: 5 },
      { title: 'Exercitar', desiredWeekFrequency: 3 },
      { title: 'medirtar', desiredWeekFrequency: 1 },
    ])
    .returning()

  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    { goalsId: result[0].id, createdAt: startOfWeek.toDate() },
    { goalsId: result[1].id, createdAt: startOfWeek.add(1, 'day').toDate() },
  ])
}

seed().finally(() => {
  client.end()
})
