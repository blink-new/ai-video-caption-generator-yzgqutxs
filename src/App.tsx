import React, { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import VideoUpload from '@/components/VideoUpload'
import CaptionEditor from '@/components/CaptionEditor'
import './App.css'

export interface VideoFile {
  file: File
  url: string
  duration: number
}

export interface Caption {
  id: string
  text: string
  startTime: number
  endTime: number
  style: {
    fontSize: number
    color: string
    backgroundColor: string
    fontFamily: string
    position: 'bottom' | 'top' | 'center'
  }
  animation: {
    type: 'none' | 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoom' | 'bounce' | 'typewriter' | 'glow'
    duration: number
    delay: number
  }
}

export interface BRollClip {
  id: string
  file: File
  url: string
  startTime: number
  endTime: number
  duration: number
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  opacity: number
}

export interface Transition {
  id: string
  type: 'cut' | 'fade' | 'slide' | 'zoom' | 'wipe' | 'dissolve'
  duration: number
  startTime: number
}

function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit'>('upload')
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null)
  const [captions, setCaptions] = useState<Caption[]>([])
  const [brollClips, setBrollClips] = useState<BRollClip[]>([])
  const [transitions, setTransitions] = useState<Transition[]>([])

  const handleVideoUpload = (video: VideoFile) => {
    setVideoFile(video)
    setCurrentStep('edit')
  }

  const handleBackToUpload = () => {
    setCurrentStep('upload')
    setVideoFile(null)
    setCaptions([])
    setBrollClips([])
    setTransitions([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === 'upload' && (
        <VideoUpload onVideoUpload={handleVideoUpload} />
      )}
      
      {currentStep === 'edit' && videoFile && (
        <CaptionEditor 
          videoFile={videoFile}
          captions={captions}
          setCaptions={setCaptions}
          brollClips={brollClips}
          setBrollClips={setBrollClips}
          transitions={transitions}
          setTransitions={setTransitions}
          onBack={handleBackToUpload}
        />
      )}
      
      <Toaster />
    </div>
  )
}

export default App