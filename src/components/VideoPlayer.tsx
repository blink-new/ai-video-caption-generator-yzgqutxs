import React, { forwardRef, useEffect, useState } from 'react'
import { VideoFile, Caption } from '@/App'

interface VideoPlayerProps {
  videoFile: VideoFile
  captions: Caption[]
  currentTime: number
  onTimeUpdate: (time: number) => void
  onPlayStateChange: (isPlaying: boolean) => void
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ videoFile, captions, currentTime, onTimeUpdate, onPlayStateChange }, ref) => {
    const [currentCaption, setCurrentCaption] = useState<Caption | null>(null)

    useEffect(() => {
      // Find the current caption based on time
      const caption = captions.find(
        cap => currentTime >= cap.startTime && currentTime <= cap.endTime
      )
      setCurrentCaption(caption || null)
    }, [currentTime, captions])

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget
      onTimeUpdate(video.currentTime)
    }

    const handlePlay = () => {
      onPlayStateChange(true)
    }

    const handlePause = () => {
      onPlayStateChange(false)
    }

    return (
      <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
        <video
          ref={ref}
          src={videoFile.url}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          controls={false}
        />
        
        {/* Caption Overlay */}
        {currentCaption && (
          <div
            className={`absolute left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg max-w-[80%] text-center ${
              currentCaption.style.position === 'top' ? 'top-8' :
              currentCaption.style.position === 'center' ? 'top-1/2 -translate-y-1/2' :
              'bottom-8'
            }`}
            style={{
              fontSize: `${currentCaption.style.fontSize}px`,
              color: currentCaption.style.color,
              backgroundColor: currentCaption.style.backgroundColor,
              fontFamily: currentCaption.style.fontFamily,
              fontWeight: 600,
              lineHeight: 1.2,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}
          >
            {currentCaption.text}
          </div>
        )}
        
        {/* Video Info Overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          {videoFile.file.name}
        </div>
      </div>
    )
  }
)

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer