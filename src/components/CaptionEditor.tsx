import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Play, Pause, Download, Wand2, Settings, Sparkles, Video, Zap, Trash2, Edit3, Plus, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { VideoFile, Caption, BRollClip, Transition } from '@/App'
import VideoPlayer from '@/components/VideoPlayer'
import CaptionTimeline from '@/components/CaptionTimeline'
import StylePanel from '@/components/StylePanel'
import AnimationPanel from '@/components/AnimationPanel'
import BRollPanel from '@/components/BRollPanel'
import TransitionsPanel from '@/components/TransitionsPanel'
import { useToast } from '@/hooks/use-toast'
import blink from '@/blink/client'
import { extractAudioFromVideo, validateVideoFile, formatFileSize, estimateProcessingTime } from '@/lib/audioUtils'

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
  const [editingCaption, setEditingCaption] = useState<Caption | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCaptionText, setNewCaptionText] = useState('')
  const [newCaptionStart, setNewCaptionStart] = useState(0)
  const [newCaptionEnd, setNewCaptionEnd] = useState(3)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  // Initialize new caption timing based on current time
  useEffect(() => {
    setNewCaptionStart(currentTime)
    setNewCaptionEnd(currentTime + 3)
  }, [currentTime])

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
      // Validate video file first
      const validation = validateVideoFile(videoFile.file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      const estimatedTime = estimateProcessingTime(videoFile.file.size)
      toast({
        title: "Generating Captions",
        description: `AI is analyzing your video (${formatFileSize(videoFile.file.size)}). Estimated time: ${estimatedTime}`,
      })

      // Extract audio from video with optimized processing
      const audioResult = await extractAudioFromVideo(videoFile.file)
      
      // Use Blink AI to transcribe audio with proper error handling
      let transcription: string
      try {
        const result = await blink.ai.transcribeAudio({
          audio: audioResult.audioData,
          language: 'en'
        })
        transcription = result.text
      } catch (transcriptionError: any) {
        // Handle specific transcription errors with better messages
        if (transcriptionError.message?.includes('Invalid array length')) {
          throw new Error('Video file is too large for processing. Please try with a smaller video file (under 50MB) or compress your video.')
        } else if (transcriptionError.message?.includes('Audio transcription failed')) {
          throw new Error('Failed to process audio from video. Please ensure your video has clear audio and try again.')
        } else if (transcriptionError.message?.includes('No audio')) {
          throw new Error('No audio track found in the video. Please ensure your video contains audio.')
        } else {
          throw new Error(`Transcription failed: ${transcriptionError.message || 'Unknown error'}`)
        }
      }

      if (!transcription || transcription.trim().length === 0) {
        throw new Error('No speech detected in the video. Please ensure your video contains clear, audible speech.')
      }

      // Use AI to break transcription into timed segments and enhance for engagement
      const { object: captionData } = await blink.ai.generateObject({
        prompt: `Analyze this video transcription and create engaging captions for social media. Break it into natural segments of 2-4 seconds each, making the text punchy and engaging. Add emojis where appropriate and ensure good readability.

Transcription: "${transcription}"

Video duration: ${videoFile.duration} seconds

Create captions that:
- Are 2-4 seconds long each
- Use engaging, social media friendly language
- Include relevant emojis
- Have natural breaks and timing
- Cover the full transcription`,
        schema: {
          type: 'object',
          properties: {
            captions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  startTime: { type: 'number' },
                  endTime: { type: 'number' }
                },
                required: ['text', 'startTime', 'endTime']
              }
            }
          },
          required: ['captions']
        }
      })

      // Convert AI response to Caption objects
      const generatedCaptions: Caption[] = captionData.captions.map((cap: any, index: number) => ({
        id: `caption-${Date.now()}-${index}`,
        text: cap.text,
        startTime: Math.max(0, cap.startTime),
        endTime: Math.min(videoFile.duration, cap.endTime),
        style: {
          fontSize: 24,
          color: '#FFFFFF',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          fontFamily: 'Inter',
          position: 'bottom' as const
        },
        animation: {
          type: index % 3 === 0 ? 'fadeIn' : index % 3 === 1 ? 'slideUp' : 'bounce',
          duration: 0.8,
          delay: 0
        }
      }))

      setCaptions(generatedCaptions)
      toast({
        title: "Captions Generated! 🎉",
        description: `Successfully generated ${generatedCaptions.length} captions from your video.`,
      })
    } catch (error: any) {
      console.error('Caption generation error:', error)
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate captions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteCaption = (captionId: string) => {
    setCaptions(prev => prev.filter(cap => cap.id !== captionId))
    if (selectedCaption === captionId) {
      setSelectedCaption(null)
    }
    toast({
      title: "Caption Deleted",
      description: "Caption has been removed from your video.",
    })
  }

  const editCaption = (caption: Caption) => {
    setEditingCaption(caption)
    setIsEditDialogOpen(true)
  }

  const saveEditedCaption = () => {
    if (!editingCaption) return
    
    setCaptions(prev => prev.map(cap => 
      cap.id === editingCaption.id ? editingCaption : cap
    ))
    setIsEditDialogOpen(false)
    setEditingCaption(null)
    toast({
      title: "Caption Updated",
      description: "Your changes have been saved.",
    })
  }

  const addNewCaption = () => {
    if (!newCaptionText.trim()) return

    const newCaption: Caption = {
      id: `caption-${Date.now()}`,
      text: newCaptionText,
      startTime: newCaptionStart,
      endTime: newCaptionEnd,
      style: {
        fontSize: 24,
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        fontFamily: 'Inter',
        position: 'bottom'
      },
      animation: {
        type: 'fadeIn',
        duration: 0.8,
        delay: 0
      }
    }

    setCaptions(prev => [...prev, newCaption].sort((a, b) => a.startTime - b.startTime))
    setIsAddDialogOpen(false)
    setNewCaptionText('')
    setNewCaptionStart(currentTime)
    setNewCaptionEnd(currentTime + 3)
    toast({
      title: "Caption Added",
      description: "New caption has been added to your video.",
    })
  }

  const enhanceCaptions = async () => {
    if (captions.length === 0) {
      toast({
        title: "No Captions Found",
        description: "Please generate captions first.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      toast({
        title: "Enhancing Captions",
        description: "AI is making your captions more engaging...",
      })

      const captionTexts = captions.map(cap => cap.text).join(' | ')
      
      const { object: enhancedData } = await blink.ai.generateObject({
        prompt: `Enhance these video captions to be more engaging, punchy, and social media friendly. Keep the same number of captions and similar timing, but make the text more compelling with emojis and better phrasing.

Current captions: "${captionTexts}"

Make them:
- More engaging and punchy
- Add relevant emojis
- Use social media friendly language
- Keep similar length and meaning
- Make them more likely to grab attention`,
        schema: {
          type: 'object',
          properties: {
            enhancedCaptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' }
                },
                required: ['text']
              }
            }
          },
          required: ['enhancedCaptions']
        }
      })

      const enhancedCaptions = captions.map((caption, index) => ({
        ...caption,
        text: enhancedData.enhancedCaptions[index]?.text || caption.text
      }))

      setCaptions(enhancedCaptions)
      toast({
        title: "Captions Enhanced! ✨",
        description: "Your captions are now more engaging and social media ready.",
      })
    } catch (error: any) {
      toast({
        title: "Enhancement Failed",
        description: error.message || "Failed to enhance captions. Please try again.",
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
              <Mic className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Auto Generate'}
            </Button>

            <Button
              onClick={enhanceCaptions}
              disabled={isGenerating || captions.length === 0}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Enhance
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewCaptionStart(currentTime)
                    setNewCaptionEnd(currentTime + 3)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Caption
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Caption</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Caption Text</label>
                    <Textarea
                      value={newCaptionText}
                      onChange={(e) => setNewCaptionText(e.target.value)}
                      placeholder="Enter caption text..."
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Time (s)</label>
                      <Input
                        type="number"
                        value={newCaptionStart}
                        onChange={(e) => setNewCaptionStart(parseFloat(e.target.value) || 0)}
                        min={0}
                        max={videoFile.duration}
                        step={0.1}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Time (s)</label>
                      <Input
                        type="number"
                        value={newCaptionEnd}
                        onChange={(e) => setNewCaptionEnd(parseFloat(e.target.value) || 0)}
                        min={newCaptionStart}
                        max={videoFile.duration}
                        step={0.1}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addNewCaption} disabled={!newCaptionText.trim()}>
                      Add Caption
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
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
              <div className="h-full flex flex-col">
                {/* Caption List */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm">Captions ({captions.length})</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewCaptionStart(currentTime)
                        setNewCaptionEnd(currentTime + 3)
                        setIsAddDialogOpen(true)
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {captions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No captions yet</p>
                        <p className="text-xs">Click "Auto Generate" to create captions</p>
                      </div>
                    ) : (
                      captions.map((caption) => (
                        <div
                          key={caption.id}
                          className={`p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                            selectedCaption === caption.id
                              ? 'border-indigo-300 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedCaption(caption.id)
                            handleSeek(caption.startTime)
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {caption.text}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {Math.floor(caption.startTime)}s - {Math.floor(caption.endTime)}s
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  editCaption(caption)
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteCaption(caption.id)
                                }}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Style Panel */}
                <div className="flex-1 overflow-y-auto">
                  <StylePanel
                    captions={captions}
                    setCaptions={setCaptions}
                    selectedCaption={selectedCaption}
                  />
                </div>
              </div>
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



      {/* Edit Caption Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Caption</DialogTitle>
          </DialogHeader>
          {editingCaption && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Caption Text</label>
                <Textarea
                  value={editingCaption.text}
                  onChange={(e) => setEditingCaption({
                    ...editingCaption,
                    text: e.target.value
                  })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time (s)</label>
                  <Input
                    type="number"
                    value={editingCaption.startTime}
                    onChange={(e) => setEditingCaption({
                      ...editingCaption,
                      startTime: parseFloat(e.target.value) || 0
                    })}
                    min={0}
                    max={videoFile.duration}
                    step={0.1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time (s)</label>
                  <Input
                    type="number"
                    value={editingCaption.endTime}
                    onChange={(e) => setEditingCaption({
                      ...editingCaption,
                      endTime: parseFloat(e.target.value) || 0
                    })}
                    min={editingCaption.startTime}
                    max={videoFile.duration}
                    step={0.1}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEditedCaption}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CaptionEditor