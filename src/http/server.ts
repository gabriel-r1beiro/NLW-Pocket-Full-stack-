import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoal } from '../functions/create-goal'
import z from 'zod'
import { getWeekPenddingGoal } from '../functions/get-week-pendding-goal'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeekFrequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async request => {
    const { desiredWeekFrequency, title } = request.body

    await createGoal({
      title: title,
      desiredWeekFrequency: desiredWeekFrequency,
    })
  }
)

app.get("/pending-goals",async () => {
	const { pendingGoals } = await getWeekPenddingGoal();

	return { pendingGoals }
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Http Server Running')
  })
