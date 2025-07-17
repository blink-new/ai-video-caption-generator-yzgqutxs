import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Play, Sparkles } from 'lucide-react'
import { Caption } from '@/App'

interface AnimationPanelProps {
  captions: Caption[]
  setCaptions: React.Dispatch<React.SetStateAction<Caption[]>>
  selectedCaption: string | null
  onPreviewAnimation: (captionId: string) => void
}

const AnimationPanel: React.FC<AnimationPanelProps> = ({
  captions,
  setCaptions,
  selectedCaption,
  onPreviewAnimation
}) => {
  const currentCaption = captions.find(cap => cap.id === selectedCaption)

  const updateCaptionAnimation = (updates: Partial<Caption['animation']>) => {
    if (!selectedCaption) return
    
    setCaptions(prev => prev.map(caption => 
      caption.id === selectedCaption
        ? { ...caption, animation: { ...caption.animation, ...updates } }
        : caption
    ))
  }

  const applyAnimationToAll = () => {
    if (!currentCaption) return
    
    setCaptions(prev => prev.map(caption => ({
      ...caption,
      animation: { ...currentCaption.animation }
    })))
  }

  const animationTypes = [
    { value: 'none', label: 'None', description: 'No animation' },
    { value: 'fadeIn', label: 'Fade In', description: 'Smooth fade in effect' },
    { value: 'slideUp', label: 'Slide Up', description: 'Slide from bottom' },
    { value: 'slideDown', label: 'Slide Down', description: 'Slide from top' },
    { value: 'slideLeft', label: 'Slide Left', description: 'Slide from right' },
    { value: 'slideRight', label: 'Slide Right', description: 'Slide from left' },
    { value: 'zoom', label: 'Zoom In', description: 'Scale up effect' },
    { value: 'bounce', label: 'Bounce', description: 'Bouncy entrance' },
    { value: 'typewriter', label: 'Typewriter', description: 'Character by character' },
    { value: 'glow', label: 'Glow', description: 'Glowing effect' }
  ]

  const presetAnimations = [
    {
      name: 'Subtle',
      animation: { type: 'fadeIn' as const, duration: 0.5, delay: 0 }
    },
    {
      name: 'Dynamic',
      animation: { type: 'slideUp' as const, duration: 0.8, delay: 0.2 }
    },
    {
      name: 'Energetic',
      animation: { type: 'bounce' as const, duration: 1.0, delay: 0 }
    },
    {
      name: 'Dramatic',
      animation: { type: 'zoom' as const, duration: 1.2, delay: 0.3 }
    },
    {
      name: 'Typewriter',
      animation: { type: 'typewriter' as const, duration: 2.0, delay: 0 }
    }
  ]

  if (!currentCaption) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="mb-2">No caption selected</p>
              <p className="text-sm">
                Select a caption to add animations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Animation Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Animation Presets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {presetAnimations.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => updateCaptionAnimation(preset.animation)}
                className="h-auto p-3 flex flex-col items-start"
              >
                <span className="font-medium">{preset.name}</span>
                <span className="text-xs text-gray-500 capitalize">
                  {preset.animation.type.replace(/([A-Z])/g, ' $1')}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Animation Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Animation Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="animation-type">Effect</Label>
            <Select
              value={currentCaption.animation.type}
              onValueChange={(value: Caption['animation']['type']) => 
                updateCaptionAnimation({ type: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {animationTypes.map(animation => (
                  <SelectItem key={animation.value} value={animation.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{animation.label}</span>
                      <span className="text-xs text-gray-500">{animation.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPreviewAnimation(currentCaption.id)}
              className="flex-shrink-0"
            >
              <Play className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <span className="text-sm text-gray-500">
              See how the animation looks
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Animation Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="animation-duration">
              Duration: {currentCaption.animation.duration.toFixed(1)}s
            </Label>
            <Slider
              id="animation-duration"
              min={0.1}
              max={3.0}
              step={0.1}
              value={[currentCaption.animation.duration]}
              onValueChange={([value]) => updateCaptionAnimation({ duration: value })}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Fast (0.1s)</span>
              <span>Slow (3.0s)</span>
            </div>
          </div>

          <div>
            <Label htmlFor="animation-delay">
              Delay: {currentCaption.animation.delay.toFixed(1)}s
            </Label>
            <Slider
              id="animation-delay"
              min={0}
              max={2.0}
              step={0.1}
              value={[currentCaption.animation.delay]}
              onValueChange={([value]) => updateCaptionAnimation({ delay: value })}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>No delay</span>
              <span>2s delay</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apply to All */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Animation</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={applyAnimationToAll}
            className="w-full"
            variant="outline"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Apply to All Captions
          </Button>
        </CardContent>
      </Card>

      {/* Animation Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 min-h-[120px] flex items-center justify-center relative overflow-hidden">
            <div
              className={`px-4 py-2 rounded-lg max-w-full text-center transition-all duration-300 ${
                currentCaption.animation.type === 'glow' ? 'animate-pulse' : ''
              }`}
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
                animationDelay: `${currentCaption.animation.delay}s`
              }}
            >
              {currentCaption.text}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Animation: {animationTypes.find(a => a.value === currentCaption.animation.type)?.label}
            {currentCaption.animation.duration > 0 && ` • ${currentCaption.animation.duration}s`}
            {currentCaption.animation.delay > 0 && ` • ${currentCaption.animation.delay}s delay`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnimationPanel