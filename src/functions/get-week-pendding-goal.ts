import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { and, count, gte, lte } from 'drizzle-orm'

dayjs.extend(weekOfYear)

export async function getWeekPenddingGoal() {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCreatedUpWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeekFrequency: goals.desiredWeekFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  )

  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalsId,
        completionCount: count(goalCompletions.id),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek), // somente as goals criadas nessa semana
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalsId)
  )

  const pendingGoals = await db
    .with(goalsCreatedUpWeek, goalCompletionCounts)
    .select()
    .from(goalsCreatedUpWeek)

  return {
    pendingGoals,
  }
}
