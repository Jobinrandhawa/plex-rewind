import Card from '@/components/Card/Card'
import { ALLOWED_PERIODS, metaDescription } from '@/utils/constants'
import fetchTautulli, {
  TautulliItemRows,
  getServerId,
} from '@/utils/fetchTautulli'
import fetchTmdb, { TmdbExternalId, TmdbItem } from '@/utils/fetchTmdb'
import { bytesToSize, secondsToTime, timeToSeconds } from '@/utils/formatting'
import { FilterQueryParams } from '@/utils/types'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Movies | Plex rewind dashboard',
  description: metaDescription,
}

async function getMovies(period: number) {
  const moviesData = await fetchTautulli<TautulliItemRows>('get_home_stats', {
    stat_id: 'top_movies',
    stats_count: 6,
    stats_type: 'duration',
    time_range: period,
  })
  const movies = moviesData.response?.data?.rows
  const ratingKeys: number[] = []

  movies.map((movie) => {
    ratingKeys.push(movie.rating_key)
  })

  const additionalData = await Promise.all(
    ratingKeys.map(async (key, i) => {
      const movieTautulli = await fetchTautulli<TautulliItemRows>(
        'get_metadata',
        {
          rating_key: key,
        },
        true,
      )
      const movieTautulliData = movieTautulli.response?.data
      // Tautulli doesn't return rating for removed items, so we're using TMDB
      const movieTmdb = await fetchTmdb<TmdbItem>('search/movie', {
        query: movies[i].title,
        first_air_date_year: movies[i].year,
      })
      const tmdbId = movieTmdb.results[0].id
      const imdbId = await fetchTmdb<TmdbExternalId>(
        `movie/${tmdbId}/external_ids`,
      )

      return {
        is_deleted: Object.keys(movieTautulliData).length === 0,
        rating: movieTmdb.results[0].vote_average.toFixed(1),
        tmdb_id: tmdbId,
        imdb_id: imdbId.imdb_id,
      }
    }),
  )

  movies.map((movie, i) => {
    movie.is_deleted = additionalData[i].is_deleted
    movie.rating = additionalData[i].rating
    movie.tmdb_id = additionalData[i].tmdb_id
    movie.imdb_id = additionalData[i].imdb_id
  })

  return movies
}

async function getTotalDuration(period: string) {
  const totalDuration = await fetchTautulli<{ total_duration: string }>(
    'get_history',
    {
      section_id: 3,
      after: period,
      length: 0,
    },
  )

  return secondsToTime(
    timeToSeconds(totalDuration.response?.data?.total_duration),
  )
}

async function getTotalSize() {
  const totalSize = await fetchTautulli<{ total_file_size: number }>(
    'get_library_media_info',
    {
      section_id: 3,
      length: 0,
    },
  )

  return bytesToSize(totalSize.response?.data.total_file_size)
}

export default async function Movies({
  searchParams,
}: {
  searchParams: FilterQueryParams
}) {
  const periodKey =
    searchParams.period && ALLOWED_PERIODS[searchParams.period]
      ? searchParams.period
      : '30days'
  const period = ALLOWED_PERIODS[periodKey]

  const [movies, totalDuration, totalSize, serverId] = await Promise.all([
    getMovies(period.daysAgo),
    getTotalDuration(period.string),
    getTotalSize(),
    getServerId(),
  ])

  return (
    <Card
      title='Movies'
      items={movies}
      totalDuration={totalDuration}
      totalSize={totalSize}
      prevCard='/dashboard/shows'
      nextCard='/dashboard/music'
      page='2 / 4'
      type='movies'
      serverId={serverId}
    />
  )
}
