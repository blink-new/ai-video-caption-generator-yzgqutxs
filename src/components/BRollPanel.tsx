import React, { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Upload, Video, Trash2, Move, Eye, EyeOff } from 'lucide-react'
import { BRollClip } from '@/App'
import { useToast } from '@/hooks/use-toast'

interface BRollPanelProps {
  brollClips: BRollClip[]
  setBrollClips: React.Dispatch<React.SetStateAction<BRollClip[]>>
  videoDuration: number
  currentTime: number
  selectedClip: string | null
  onSelectClip: (id: string | null) => void
}

const BRollPanel: React.FC<BRollPanelProps> = ({
  brollClips,
  setBrollClips,
  videoDuration,
  currentTime,
  selectedClip,
  onSelectClip
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const currentClip = brollClips.find(clip => clip.id === selectedClip)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('video/')) {
          toast({
            title: "Invalid File",
            description: `${file.name} is not a video file.`,
            variant: "destructive"
          })
          continue
        }

        // Create video element to get duration
        const video = document.createElement('video')
        video.preload = 'metadata'
        
        const duration = await new Promise<number>((resolve) => {
          video.onloadedmetadata = () => {
            resolve(video.duration)
          }
          video.src = URL.createObjectURL(file)
        })

        const newClip: BRollClip = {
          id: `broll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          url: URL.createObjectURL(file),
          startTime: currentTime,
          endTime: Math.min(currentTime + duration, videoDuration),
          duration,
          position: {
            x: 20,
            y: 20,
            width: 30,
            height: 30
          },
          opacity: 0.8
        }

        setBrollClips(prev => [...prev, newClip])
      }

      toast({
        title: "B-Roll Added",
        description: `${files.length} video${files.length > 1 ? 's' : ''} added successfully.`,
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process video files.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const updateClip = (updates: Partial<BRollClip>) => {
    if (!selectedClip) return
    
    setBrollClips(prev => prev.map(clip => 
      clip.id === selectedClip
        ? { ...clip, ...updates }
        : clip
    ))
  }

  const deleteClip = (clipId: string) => {
    setBrollClips(prev => prev.filter(clip => clip.id !== clipId))
    if (selectedClip === clipId) {
      onSelectClip(null)
    }
    toast({
      title: "B-Roll Removed",
      description: "Video clip has been deleted.",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const presetPositions = [
    { name: 'Top Left', position: { x: 5, y: 5, width: 25, height: 25 } },
    { name: 'Top Right', position: { x: 70, y: 5, width: 25, height: 25 } },
    { name: 'Bottom Left', position: { x: 5, y: 70, width: 25, height: 25 } },
    { name: 'Bottom Right', position: { x: 70, y: 70, width: 25, height: 25 } },
    { name: 'Center', position: { x: 37.5, y: 37.5, width: 25, height: 25 } },
    { name: 'Full Screen', position: { x: 0, y: 0, width: 100, height: 100 } }
  ]

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Video className="h-5 w-5 mr-2" />
            B-Roll Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Add B-Roll Videos'}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Upload video files to overlay on your main video
          </p>
        </CardContent>
      </Card>

      {/* B-Roll Clips List */}
      {brollClips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Clips ({brollClips.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {brollClips.map((clip) => (
              <div
                key={clip.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedClip === clip.id
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => onSelectClip(clip.id === selectedClip ? null : clip.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate flex-1">
                    {clip.file.name}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteClip(clip.id)
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                  </span>
                  <span>
                    {(clip.endTime - clip.startTime).toFixed(1)}s
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {clip.position.width}% × {clip.position.height}%
                  </span>
                  <span>
                    {Math.round(clip.opacity * 100)}% opacity
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Clip Settings */}
      {currentClip && (
        <>
          {/* Timing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="number"
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={currentClip.startTime.toFixed(1)}
                    onChange={(e) => updateClip({ 
                      startTime: Math.max(0, Math.min(parseFloat(e.target.value) || 0, videoDuration))
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="number"
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={currentClip.endTime.toFixed(1)}
                    onChange={(e) => updateClip({ 
                      endTime: Math.max(0, Math.min(parseFloat(e.target.value) || 0, videoDuration))
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Duration: {(currentClip.endTime - currentClip.startTime).toFixed(1)}s
              </div>
            </CardContent>
          </Card>

          {/* Position Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Position Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {presetPositions.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => updateClip({ position: preset.position })}
                    className="h-auto p-2 text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Position & Size */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Move className="h-5 w-5 mr-2" />
                Position & Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pos-x">X Position: {currentClip.position.x.toFixed(1)}%</Label>
                  <Slider
                    id="pos-x"
                    min={0}
                    max={100}
                    step={0.5}
                    value={[currentClip.position.x]}
                    onValueChange={([value]) => updateClip({ 
                      position: { ...currentClip.position, x: value }
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="pos-y">Y Position: {currentClip.position.y.toFixed(1)}%</Label>
                  <Slider
                    id="pos-y"
                    min={0}
                    max={100}
                    step={0.5}
                    value={[currentClip.position.y]}
                    onValueChange={([value]) => updateClip({ 
                      position: { ...currentClip.position, y: value }
                    })}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Width: {currentClip.position.width.toFixed(1)}%</Label>
                  <Slider
                    id="width"
                    min={5}
                    max={100}
                    step={0.5}
                    value={[currentClip.position.width]}
                    onValueChange={([value]) => updateClip({ 
                      position: { ...currentClip.position, width: value }
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height: {currentClip.position.height.toFixed(1)}%</Label>
                  <Slider
                    id="height"
                    min={5}
                    max={100}
                    step={0.5}
                    value={[currentClip.position.height]}
                    onValueChange={([value]) => updateClip({ 
                      position: { ...currentClip.position, height: value }
                    })}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opacity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Opacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="opacity">
                  Opacity: {Math.round(currentClip.opacity * 100)}%
                </Label>
                <Slider
                  id="opacity"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[currentClip.opacity]}
                  onValueChange={([value]) => updateClip({ opacity: value })}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Transparent</span>
                  <span>Opaque</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {brollClips.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="mb-2">No B-Roll videos added</p>
              <p className="text-sm">
                Upload videos to overlay on your main content
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BRollPanel