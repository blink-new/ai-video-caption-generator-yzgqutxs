import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Play, Pause, Download, Wand2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VideoFile, Caption } from '@/App'
import VideoPlayer from '@/components/VideoPlayer'
import CaptionTimeline from '@/components/CaptionTimeline'
import StylePanel from '@/components/StylePanel'
import { useToast } from '@/hooks/use-toast'

interface CaptionEditorProps {
  videoFile: VideoFile
  captions: Caption[]
  setCaptions: React.Dispatch<React.SetStateAction<Caption[]>>
  onBack: () => void
}

const CaptionEditor: React.FC<CaptionEditorProps> = ({
  videoFile,
  captions,
  setCaptions,
  onBack
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null)
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="style">
                <Settings className="h-4 w-4 mr-2" />
                Style
              </TabsTrigger>
              <TabsTrigger value="export">
                <Download className="h-4 w-4 mr-2" />
                Export
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="style" className="h-full p-0">
              <StylePanel
                captions={captions}
                setCaptions={setCaptions}
                selectedCaption={selectedCaption}
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