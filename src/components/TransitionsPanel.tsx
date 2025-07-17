import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Zap, Plus, Trash2, Play } from 'lucide-react'
import { Transition } from '@/App'
import { useToast } from '@/hooks/use-toast'

interface TransitionsPanelProps {
  transitions: Transition[]
  setTransitions: React.Dispatch<React.SetStateAction<Transition[]>>
  videoDuration: number
  currentTime: number
  selectedTransition: string | null
  onSelectTransition: (id: string | null) => void
  onPreviewTransition: (transitionId: string) => void
}

const TransitionsPanel: React.FC<TransitionsPanelProps> = ({
  transitions,
  setTransitions,
  videoDuration,
  currentTime,
  selectedTransition,
  onSelectTransition,
  onPreviewTransition
}) => {
  const [newTransitionTime, setNewTransitionTime] = useState(currentTime)
  const { toast } = useToast()

  const currentTransition = transitions.find(t => t.id === selectedTransition)

  const transitionTypes = [
    { value: 'cut', label: 'Cut', description: 'Instant transition' },
    { value: 'fade', label: 'Fade', description: 'Smooth fade effect' },
    { value: 'slide', label: 'Slide', description: 'Sliding transition' },
    { value: 'zoom', label: 'Zoom', description: 'Zoom in/out effect' },
    { value: 'wipe', label: 'Wipe', description: 'Directional wipe' },
    { value: 'dissolve', label: 'Dissolve', description: 'Gradual blend' }
  ]

  const presetTransitions = [
    {
      name: 'Quick Cut',
      transition: { type: 'cut' as const, duration: 0 }
    },
    {
      name: 'Smooth Fade',
      transition: { type: 'fade' as const, duration: 0.5 }
    },
    {
      name: 'Dynamic Slide',
      transition: { type: 'slide' as const, duration: 0.8 }
    },
    {
      name: 'Dramatic Zoom',
      transition: { type: 'zoom' as const, duration: 1.0 }
    },
    {
      name: 'Cinematic Wipe',
      transition: { type: 'wipe' as const, duration: 1.2 }
    },
    {
      name: 'Artistic Dissolve',
      transition: { type: 'dissolve' as const, duration: 1.5 }
    }
  ]

  const addTransition = (type: Transition['type'], duration: number) => {
    const newTransition: Transition = {
      id: `transition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      duration,
      startTime: newTransitionTime
    }

    setTransitions(prev => [...prev, newTransition].sort((a, b) => a.startTime - b.startTime))
    onSelectTransition(newTransition.id)
    
    toast({
      title: "Transition Added",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} transition added at ${formatTime(newTransitionTime)}.`,
    })
  }

  const updateTransition = (updates: Partial<Transition>) => {
    if (!selectedTransition) return
    
    setTransitions(prev => prev.map(transition => 
      transition.id === selectedTransition
        ? { ...transition, ...updates }
        : transition
    ).sort((a, b) => a.startTime - b.startTime))
  }

  const deleteTransition = (transitionId: string) => {
    setTransitions(prev => prev.filter(t => t.id !== transitionId))
    if (selectedTransition === transitionId) {
      onSelectTransition(null)
    }
    toast({
      title: "Transition Removed",
      description: "Transition has been deleted.",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTransitionIcon = (type: Transition['type']) => {
    switch (type) {
      case 'cut': return '✂️'
      case 'fade': return '🌅'
      case 'slide': return '➡️'
      case 'zoom': return '🔍'
      case 'wipe': return '🧽'
      case 'dissolve': return '💫'
      default: return '⚡'
    }
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Add Transition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Add Transition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="transition-time">Time Position</Label>
            <Input
              id="transition-time"
              type="number"
              min={0}
              max={videoDuration}
              step={0.1}
              value={newTransitionTime.toFixed(1)}
              onChange={(e) => setNewTransitionTime(
                Math.max(0, Math.min(parseFloat(e.target.value) || 0, videoDuration))
              )}
              className="mt-1"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewTransitionTime(currentTime)}
                className="text-xs h-6"
              >
                Use Current Time
              </Button>
              <span>{formatTime(newTransitionTime)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {presetTransitions.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => addTransition(preset.transition.type, preset.transition.duration)}
                className="h-auto p-3 flex flex-col items-start"
              >
                <span className="font-medium text-xs">{preset.name}</span>
                <span className="text-xs text-gray-500">
                  {preset.transition.duration}s
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transitions List */}
      {transitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Transitions ({transitions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transitions.map((transition) => (
              <div
                key={transition.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedTransition === transition.id
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => onSelectTransition(transition.id === selectedTransition ? null : transition.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTransitionIcon(transition.type)}</span>
                    <span className="text-sm font-medium capitalize">
                      {transition.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreviewTransition(transition.id)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTransition(transition.id)
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>At {formatTime(transition.startTime)}</span>
                  <span>{transition.duration}s duration</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Transition Settings */}
      {currentTransition && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transition Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="transition-type">Type</Label>
                <Select
                  value={currentTransition.type}
                  onValueChange={(value: Transition['type']) => 
                    updateTransition({ type: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transitionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <span>{getTransitionIcon(type.value)}</span>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{type.label}</span>
                            <span className="text-xs text-gray-500">{type.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transition-start">Start Time</Label>
                <Input
                  id="transition-start"
                  type="number"
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  value={currentTransition.startTime.toFixed(1)}
                  onChange={(e) => updateTransition({ 
                    startTime: Math.max(0, Math.min(parseFloat(e.target.value) || 0, videoDuration))
                  })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="transition-duration">
                  Duration: {currentTransition.duration.toFixed(1)}s
                </Label>
                <Slider
                  id="transition-duration"
                  min={0}
                  max={3.0}
                  step={0.1}
                  value={[currentTransition.duration]}
                  onValueChange={([value]) => updateTransition({ duration: value })}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Instant</span>
                  <span>3s</span>
                </div>
              </div>

              <Button
                onClick={() => onPreviewTransition(currentTransition.id)}
                className="w-full"
                variant="outline"
              >
                <Play className="h-4 w-4 mr-2" />
                Preview Transition
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {transitions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Zap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="mb-2">No transitions added</p>
              <p className="text-sm">
                Add transitions to create smooth scene changes
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TransitionsPanel