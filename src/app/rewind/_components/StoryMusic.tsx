import CardMediaItems from '@/components/Card/CardMediaItems'
import CardText from '@/components/Card/CardText'
import { MusicalNoteIcon, PlayCircleIcon } from '@heroicons/react/24/outline'
import { UserRewind } from './RewindStories'

export default function StoryMusic({ userRewind }: UserRewind) {
  return userRewind.music_total_duration ? (
    <>
      <CardText scaleDelay={3}>
        <p>
          And to top it all off, you listened to&nbsp;
          <span className='rewind-stat'>
            {userRewind.music_total_duration}
          </span>{' '}
          of{' '}
          <span className='rewind-cat'>
            Music
            <MusicalNoteIcon />
          </span>{' '}
          on <span className='text-yellow-500'>Plex</span>.
        </p>
      </CardText>

      <CardText renderDelay={3} noScale>
        <p className='mb-2'>
          Your favorite was{' '}
          <span className='rewind-cat'>{userRewind.music_top[0].title}</span>!
        </p>

        <div className='text-base not-italic'>
          <CardMediaItems
            type='artist'
            items={Array(userRewind.music_top[0])}
            serverId={userRewind.server_id}
            rows
          />
        </div>
      </CardText>
    </>
  ) : (
    <CardText noScale>
      <p>
        You haven&apos;t listened to any{' '}
        <span className='rewind-cat'>
          Music
          <PlayCircleIcon />
        </span>{' '}
        on <span className='text-yellow-500'>Plex</span> this year{' '}
        <span className='not-italic'>😥</span>
      </p>
    </CardText>
  )
}
