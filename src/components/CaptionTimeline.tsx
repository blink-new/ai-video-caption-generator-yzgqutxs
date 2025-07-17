import React from 'react'
import { Caption } from '@/App'

interface CaptionTimelineProps {
  captions: Caption[]
  duration: number
  currentTime: number
  onSeek: (time: number) => void
  selectedCaption: string | null
  onSelectCaption: (id: string | null) => void
}

const CaptionTimeline: React.FC<CaptionTimelineProps> = ({
  captions,
  duration,
  currentTime,
  onSeek,
  selectedCaption,
  onSelectCaption
}) => {
  const timelineWidth = 100 // percentage

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const time = percentage * duration
    onSeek(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">Timeline</div>
      
      {/* Timeline Container */}
      <div className="relative">
        {/* Background Timeline */}
        <div
          className="h-12 bg-gray-200 rounded-lg cursor-pointer relative overflow-hidden"
          onClick={handleTimelineClick}
        >
          {/* Time Markers */}
          <div className="absolute inset-0 flex items-end pb-1">
            {Array.from({ length: 11 }, (_, i) => {
              const time = (i / 10) * duration
              return (
                <div
                  key={i}
                  className="flex-1 text-xs text-gray-500 text-center"
                  style={{ fontSize: '10px' }}
                >
                  {i % 2 === 0 && formatTime(time)}
                </div>
              )
            })}
          </div>
          
          {/* Caption Blocks */}
          {captions.map((caption) => {
            const startPercent = (caption.startTime / duration) * 100
            const widthPercent = ((caption.endTime - caption.startTime) / duration) * 100
            const isSelected = selectedCaption === caption.id
            
            return (
              <div
                key={caption.id}
                className={`absolute top-1 h-8 rounded cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-indigo-600 ring-2 ring-indigo-300' 
                    : 'bg-indigo-400 hover:bg-indigo-500'
                }`}
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  minWidth: '20px'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectCaption(isSelected ? null : caption.id)
                }}
                title={caption.text}
              >
                <div className="px-2 py-1 text-xs text-white font-medium truncate">
                  {caption.text}
                </div>
              </div>
            )
          })}
          
          {/* Current Time Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{
              left: `${(currentTime / duration) * 100}%`
            }}
          >
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Time Labels */}
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0:00</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Caption List */}
      {captions.length > 0 && (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          <div className="text-sm font-medium text-gray-700">
            Captions ({captions.length})
          </div>
          {captions.map((caption) => (
            <div
              key={caption.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedCaption === caption.id
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => onSelectCaption(caption.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">
                  {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
                </span>
                <span className="text-xs text-gray-400">
                  {(caption.endTime - caption.startTime).toFixed(1)}s
                </span>
              </div>
              <div className="text-sm text-gray-900 line-clamp-2">
                {caption.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CaptionTimeline