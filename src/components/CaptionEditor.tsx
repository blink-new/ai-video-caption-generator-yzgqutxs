import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Play, Pause, Download, Wand2, Settings, Sparkles, Video, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VideoFile, Caption, BRollClip, Transition } from '@/App'
import VideoPlayer from '@/components/VideoPlayer'
import CaptionTimeline from '@/components/CaptionTimeline'
import StylePanel from '@/components/StylePanel'
import AnimationPanel from '@/components/AnimationPanel'
import BRollPanel from '@/components/BRollPanel'
import TransitionsPanel from '@/components/TransitionsPanel'
import { useToast } from '@/hooks/use-toast'

interface CaptionEditorProps {
  videoFile: VideoFile
  captions: Caption[]
  setCaptions: React.Dispatch<React.SetStateAction<Caption[]>>
  brollClips: BRollClip[]
  setBrollClips: React.Dispatch<React.SetStateAction<BRollClip[]>>
  transitions: Transition[]
  setTransitions: React.Dispatch<React.SetStateAction<Transition[]>>
  onBack: () => void
}

const CaptionEditor: React.FC<CaptionEditorProps> = ({
  videoFile,
  captions,
  setCaptions,
  brollClips,
  setBrollClips,
  transitions,
  setTransitions,
  onBack
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null)
  const [selectedBrollClip, setSelectedBrollClip] = useState<string | null>(null)
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const generateCaptions = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate AI caption generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockCaptions: Caption[] = [
        {
          id: '1',
          text: 'Welcome to our amazing video!',
          startTime: 0,
          endTime: 3,
          style: {
            fontSize: 24,
            color: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            fontFamily: 'Inter',
            position: 'bottom'
          },
          animation: {
            type: 'fadeIn',
            duration: 0.8,
            delay: 0
          }
        },
        {
          id: '2',
          text: 'This is where the magic happens.',
          startTime: 3.5,
          endTime: 6.5,
          style: {
            fontSize: 24,
            color: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            fontFamily: 'Inter',
            position: 'bottom'
          },
          animation: {
            type: 'slideUp',
            duration: 0.6,
            delay: 0.2
          }
        },
        {
          id: '3',
          text: 'AI-powered captions make everything better!',
          startTime: 7,
          endTime: 10,
          style: {
            fontSize: 24,
            color: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            fontFamily: 'Inter',
            position: 'bottom'
          },
          animation: {
            type: 'bounce',
            duration: 1.0,
            delay: 0
          }
        }
      ]
      
      setCaptions(mockCaptions)
      toast({
        title: "Captions Generated!",
        description: "AI has successfully generated captions for your video.",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate captions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const exportCaptions = () => {
    // Create SRT format
    const srtContent = captions.map((caption, index) => {
      const startTime = formatTime(caption.startTime)
      const endTime = formatTime(caption.endTime)
      return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`
    }).join('\n')

    const blob = new Blob([srtContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'captions.srt'
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Captions exported as SRT file.",
    })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
  }

  const handlePreviewAnimation = (captionId: string) => {
    const caption = captions.find(c => c.id === captionId)
    if (caption && videoRef.current) {
      videoRef.current.currentTime = caption.startTime
      setCurrentTime(caption.startTime)
      toast({
        title: "Animation Preview",
        description: `Previewing ${caption.animation.type} animation`,
      })
    }
  }

  const handlePreviewTransition = (transitionId: string) => {
    const transition = transitions.find(t => t.id === transitionId)
    if (transition && videoRef.current) {
      videoRef.current.currentTime = transition.startTime
      setCurrentTime(transition.startTime)
      toast({
        title: "Transition Preview",
        description: `Previewing ${transition.type} transition`,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Caption Editor
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={generateCaptions}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Captions'}
            </Button>
            
            <Button
              onClick={exportCaptions}
              variant="outline"
              disabled={captions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Player Section */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <VideoPlayer
                ref={videoRef}
                videoFile={videoFile}
                captions={captions}
                brollClips={brollClips}
                transitions={transitions}
                currentTime={currentTime}
                onTimeUpdate={handleTimeUpdate}
                onPlayStateChange={setIsPlaying}
              />
              
              {/* Video Controls */}
              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handlePlayPause}
                    size="sm"
                    variant="outline"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <Slider
                      value={[currentTime]}
                      max={videoFile.duration}
                      step={0.1}
                      onValueChange={([value]) => handleSeek(value)}
                      className="w-full"
                    />
                  </div>
                  
                  <span className="text-sm text-gray-500 min-w-[100px]">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(videoFile.duration / 60)}:{Math.floor(videoFile.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                
                <CaptionTimeline
                  captions={captions}
                  duration={videoFile.duration}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                  selectedCaption={selectedCaption}
                  onSelectCaption={setSelectedCaption}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-gray-200 bg-white">
          <Tabs defaultValue="style" className="h-full">
            <TabsList className="grid w-full grid-cols-5 text-xs">
              <TabsTrigger value="style" className="p-2">
                <Settings className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="animations" className="p-2">
                <Sparkles className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="broll" className="p-2">
                <Video className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="transitions" className="p-2">
                <Zap className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="export" className="p-2">
                <Download className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="style" className="h-full p-0">
              <StylePanel
                captions={captions}
                setCaptions={setCaptions}
                selectedCaption={selectedCaption}
              />
            </TabsContent>

            <TabsContent value="animations" className="h-full p-0">
              <AnimationPanel
                captions={captions}
                setCaptions={setCaptions}
                selectedCaption={selectedCaption}
                onPreviewAnimation={handlePreviewAnimation}
              />
            </TabsContent>

            <TabsContent value="broll" className="h-full p-0">
              <BRollPanel
                brollClips={brollClips}
                setBrollClips={setBrollClips}
                videoDuration={videoFile.duration}
                currentTime={currentTime}
                selectedClip={selectedBrollClip}
                onSelectClip={setSelectedBrollClip}
              />
            </TabsContent>

            <TabsContent value="transitions" className="h-full p-0">
              <TransitionsPanel
                transitions={transitions}
                setTransitions={setTransitions}
                videoDuration={videoFile.duration}
                currentTime={currentTime}
                selectedTransition={selectedTransition}
                onSelectTransition={setSelectedTransition}
                onPreviewTransition={handlePreviewTransition}
              />
            </TabsContent>
            
            <TabsContent value="export" className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={exportCaptions}
                    className="w-full"
                    disabled={captions.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download SRT
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={captions.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download VTT
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={captions.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Video with Captions
                  </Button>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">
                      Project Summary:
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• {captions.length} captions</div>
                      <div>• {brollClips.length} B-Roll clips</div>
                      <div>• {transitions.length} transitions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default CaptionEditor