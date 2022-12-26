import { ClockIcon } from '@heroicons/react/24/outline'
import CardContent from '../../../ui/CardContent'
import CardHeading from '../../../ui/CardHeading'
import fetchFromTautulli from '../../../utils/fetchFromTautulli'
import { FIRST_OF_CURRENT_YEAR, removeAfterMinutes } from '../../../utils/time'

async function getTotalDuration() {
  const totalDuration = await fetchFromTautulli('get_history', {
    user_id: 8898770,
    length: 0,
    after: FIRST_OF_CURRENT_YEAR,
  })

  return totalDuration
}

export default async function Total() {
  const totalDuration = await getTotalDuration()

  return (
    <CardContent
      statTitle="Watch time"
      statCategory="Total"
      page="1 / 4"
      nextCard="/rewind/shows"
      subtitle="Rauno T"
    >
      <div className="flex flex-col justify-center flex-1 pb-12">
        <CardHeading>
          You&apos;ve spent a{' '}
          <span className="inline-flex items-center text-teal-300">
            Total
            <ClockIcon className="w-8 ml-1" />
          </span>{' '}
          of{' '}
          <span className="inline-block text-3xl font-semibold text-black">
            {removeAfterMinutes(totalDuration.response.data.total_duration)}
          </span>{' '}
          on <span className="text-yellow-500">Plex</span> this year!
        </CardHeading>
      </div>
    </CardContent>
  )
}
