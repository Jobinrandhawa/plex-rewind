// TODO: Define a type for the query parameters
type QueryParams = {
  [key: string]: string | number
}

// TODO: Replace 'any' with a more specific type based on the expected API response structure from TMDB
type TmdbResponse = any

export default async function fetchTmdb(
  endpoint: string,
  params?: QueryParams
): Promise<TmdbResponse> {
  const query = params
    ? '&' + new URLSearchParams(params as Record<string, string>).toString()
    : ''
  const apiUrl = `https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_API_KEY}${query}`
  const res = await fetch(apiUrl, { next: { revalidate: 3600 } })
  const data = await res.json()

  return data
}
