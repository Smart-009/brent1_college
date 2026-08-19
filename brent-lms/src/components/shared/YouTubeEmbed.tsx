import { extractYouTubeId } from '@/lib/utils'

interface YouTubeEmbedProps {
  url: string
  title?: string
}

export function YouTubeEmbed({ url, title = 'Lesson Video' }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url)

  if (!videoId) {
    return (
      <div className="alert alert-warning">
        <span className="alert-icon">⚠️</span>
        <div>Invalid YouTube URL. Please make sure the video link is correct.</div>
      </div>
    )
  }

  return (
    <div className="video-wrapper">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
