import CardContent from '../../../ui/CardContent'
import { DAYS_AGO_30 } from '../../../utils/constants'
import fetchFromTautulli from '../../../utils/fetchFromTautulli'
import { bytesToSize, removeAfterMinutes } from '../../../utils/formatting'

async function getShows() {
  const shows = await fetchFromTautulli('get_home_stats', {
    stat_id: 'top_tv',
    stats_count: 6,
    stats_type: 'duration',
    time_range: 30,
  })

  return shows
}

async function getTotalDuration() {
  const totalDuration = await fetchFromTautulli('get_history', {
    section_id: 2,
    after: DAYS_AGO_30,
    length: 0,
  })

  return totalDuration
}

async function getTotalSize() {
  const totalSize = await fetchFromTautulli('get_library_media_info', {
    section_id: 2,
    length: 0,
  })

  return totalSize
}

export default async function Shows() {
  const [shows, totalDuration, totalSize] = await Promise.all([
    getShows(),
    getTotalDuration(),
    getTotalSize(),
  ])

  return (
    <CardContent
      statTitle="Most watched"
      statCategory="TV shows"
      items={shows.response.data.rows}
      totalDuration={removeAfterMinutes(
        totalDuration.response.data.total_duration,
      )}
      totalSize={bytesToSize(totalSize.response.data.total_file_size)}
      nextCard="dashboard/movies"
      page="1 / 4"
      type="shows"
    />
  )
}
