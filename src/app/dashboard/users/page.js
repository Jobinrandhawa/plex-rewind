import CardContent from '@/components/CardContent'
import { ALLOWED_PERIODS, metaDescription } from '@/utils/constants'
import {
  fetchOverseerrUserId,
  fetchPaginatedOverseerrStats,
} from '@/utils/fetchOverseerr'
import fetchTautulli from '@/utils/fetchTautulli'
import { secondsToTime, timeToSeconds } from '@/utils/formatting'

export const metadata = {
  title: 'Users | Plex rewind dashboard',
  description: metaDescription,
}

async function getUsers(period, requestsPeriod, periodString) {
  const usersPromise = await fetchTautulli('get_home_stats', {
    stat_id: 'top_users',
    stats_count: 6,
    stats_type: 'duration',
    time_range: period,
  })
  const users = usersPromise.response?.data?.rows

  const overseerrUserIds = await Promise.all(
    users.map(async (user) => {
      const overseerrId = await fetchOverseerrUserId(user.user_id)

      return overseerrId
    })
  )

  const usersRequestsCounts = await Promise.all(
    overseerrUserIds.map(async (overseerrId) => {
      const userTotal = await fetchPaginatedOverseerrStats(
        `user/${overseerrId}/requests`,
        requestsPeriod
      )

      return {
        requests: userTotal.length,
      }
    })
  )

  const usersPlaysAndDurations = await Promise.all(
    users.map(async (user) => {
      const userMovies = await fetchTautulli('get_history', {
        user_id: user.user_id,
        after: periodString,
        section_id: 3,
      })
      const userShows = await fetchTautulli('get_history', {
        user_id: user.user_id,
        after: periodString,
        section_id: 2,
      })
      const userMusic = await fetchTautulli('get_history', {
        user_id: user.user_id,
        after: periodString,
        section_id: 1,
      })
      const userAudiobook = await fetchTautulli('get_history', {
        user_id: user.user_id,
        after: periodString,
        section_id: 4,
      })

      return {
        movies_plays_count: userMovies.response?.data?.recordsFiltered,
        shows_plays_count: userShows.response?.data?.recordsFiltered,
        music_plays_count: userMusic.response?.data?.recordsFiltered,
        audiobook_plays_count: userAudiobook.response?.data?.recordsFiltered,
      }
    })
  )

  users.map((user, i) => {
    user.requests = usersRequestsCounts[i].requests
    user.movies_plays_count = usersPlaysAndDurations[i].movies_plays_count
    user.shows_plays_count = usersPlaysAndDurations[i].shows_plays_count
    user.music_plays_count = usersPlaysAndDurations[i].music_plays_count
    user.audiobook_plays_count = usersPlaysAndDurations[i].audiobook_plays_count
  })

  return users
}

async function getTotalDuration(period) {
  const totalDuration = await fetchTautulli('get_history', {
    after: period,
    length: 0,
  })

  return secondsToTime(
    timeToSeconds(totalDuration.response?.data?.total_duration)
  )
}

async function getUsersCount() {
  const usersCount = await fetchTautulli('get_users')

  return usersCount.response?.data.slice(1).length
}

export default async function Users({ searchParams }) {
  let period = ALLOWED_PERIODS['30days']
  if (ALLOWED_PERIODS[searchParams.period]) {
    period = ALLOWED_PERIODS[searchParams.period]
  }

  const [usersData, totalDuration, usersCount] = await Promise.all([
    getUsers(period.daysAgo, period.date, period.string),
    getTotalDuration(period.string),
    getUsersCount(),
  ])

  return (
    <CardContent
      title='Users'
      items={usersData}
      totalDuration={totalDuration}
      totalSize={usersCount}
      prevCard='/dashboard/music'
      page='4 / 4'
      type='users'
    />
  )
}
