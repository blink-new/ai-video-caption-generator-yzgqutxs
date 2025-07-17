import React, { forwardRef, useEffect, useState } from 'react'
import { VideoFile, Caption, BRollClip, Transition } from '@/App'

interface VideoPlayerProps {
  videoFile: VideoFile
  captions: Caption[]
  brollClips: BRollClip[]
  transitions: Transition[]
  currentTime: number
  onTimeUpdate: (time: number) => void
  onPlayStateChange: (isPlaying: boolean) => void
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ videoFile, captions, brollClips, transitions, currentTime, onTimeUpdate, onPlayStateChange }, ref) => {
    const [currentCaption, setCurrentCaption] = useState<Caption | null>(null)
    const [activeBrollClips, setActiveBrollClips] = useState<BRollClip[]>([])
    const [currentTransition, setCurrentTransition] = useState<Transition | null>(null)
    const [animationKey, setAnimationKey] = useState(0)

    useEffect(() => {
      // Find the current caption based on time
      const caption = captions.find(
        cap => currentTime >= cap.startTime && currentTime <= cap.endTime
      )
      
      // Trigger animation reset when caption changes
      if (caption && caption.id !== currentCaption?.id) {
        setAnimationKey(prev => prev + 1)
      }
      
      setCurrentCaption(caption || null)
    }, [currentTime, captions, currentCaption?.id])

    useEffect(() => {
      // Find active B-Roll clips
      const activeClips = brollClips.filter(
        clip => currentTime >= clip.startTime && currentTime <= clip.endTime
      )
      setActiveBrollClips(activeClips)
    }, [currentTime, brollClips])

    useEffect(() => {
      // Find current transition
      const transition = transitions.find(
        t => currentTime >= t.startTime && currentTime <= (t.startTime + t.duration)
      )
      setCurrentTransition(transition || null)
    }, [currentTime, transitions])

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

    const getAnimationClass = (animation: Caption['animation']) => {
      switch (animation.type) {
        case 'fadeIn':
          return 'animate-fade-in'
        case 'slideUp':
          return 'animate-slide-up'
        case 'slideDown':
          return 'animate-slide-down'
        case 'slideLeft':
          return 'animate-slide-left'
        case 'slideRight':
          return 'animate-slide-right'
        case 'zoom':
          return 'animate-zoom-in'
        case 'bounce':
          return 'animate-bounce-in'
        case 'typewriter':
          return 'animate-typewriter'
        case 'glow':
          return 'animate-glow'
        default:
          return ''
      }
    }

    const getTransitionOverlay = () => {
      if (!currentTransition) return null

      const progress = (currentTime - currentTransition.startTime) / currentTransition.duration
      const opacity = Math.min(1, progress * 2) // Fade in first half, stay visible second half

      switch (currentTransition.type) {
        case 'fade':
          return (
            <div 
              className="absolute inset-0 bg-black transition-opacity duration-300"
              style={{ opacity: opacity * 0.8 }}
            />
          )
        case 'slide':
          return (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black transition-transform duration-300"
              style={{ 
                transform: `translateX(${(progress - 0.5) * 200}%)`,
                opacity: opacity * 0.6
              }}
            />
          )
        case 'zoom':
          return (
            <div 
              className="absolute inset-0 bg-black transition-all duration-300"
              style={{ 
                opacity: opacity * 0.5,
                transform: `scale(${1 + progress * 0.1})`
              }}
            />
          )
        case 'wipe':
          return (
            <div 
              className="absolute inset-0 bg-black transition-all duration-300"
              style={{ 
                clipPath: `polygon(0 0, ${progress * 100}% 0, ${progress * 100}% 100%, 0 100%)`
              }}
            />
          )
        case 'dissolve':
          return (
            <div 
              className="absolute inset-0 bg-white transition-opacity duration-300"
              style={{ 
                opacity: Math.sin(progress * Math.PI) * 0.3,
                filter: 'blur(2px)'
              }}
            />
          )
        default:
          return null
      }
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
        
        {/* B-Roll Overlays */}
        {activeBrollClips.map((clip) => (
          <video
            key={clip.id}
            src={clip.url}
            className="absolute object-cover rounded"
            style={{
              left: `${clip.position.x}%`,
              top: `${clip.position.y}%`,
              width: `${clip.position.width}%`,
              height: `${clip.position.height}%`,
              opacity: clip.opacity,
              zIndex: 10
            }}
            autoPlay
            muted
            loop
          />
        ))}
        
        {/* Caption Overlay */}
        {currentCaption && (
          <div
            key={animationKey}
            className={`absolute left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg max-w-[80%] text-center ${
              currentCaption.style.position === 'top' ? 'top-8' :
              currentCaption.style.position === 'center' ? 'top-1/2 -translate-y-1/2' :
              'bottom-8'
            } ${getAnimationClass(currentCaption.animation)}`}
            style={{
              fontSize: `${currentCaption.style.fontSize}px`,
              color: currentCaption.style.color,
              backgroundColor: currentCaption.style.backgroundColor,
              fontFamily: currentCaption.style.fontFamily,
              fontWeight: 600,
              lineHeight: 1.2,
              textShadow: currentCaption.animation.type === 'glow' 
                ? `0 0 10px ${currentCaption.style.color}, 0 0 20px ${currentCaption.style.color}` 
                : '2px 2px 4px rgba(0, 0, 0, 0.5)',
              animationDuration: `${currentCaption.animation.duration}s`,
              animationDelay: `${currentCaption.animation.delay}s`,
              animationFillMode: 'both',
              zIndex: 20
            }}
          >
            {currentCaption.text}
          </div>
        )}
        
        {/* Transition Overlay */}
        {getTransitionOverlay()}
        
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