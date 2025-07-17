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
}

function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit'>('upload')
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null)
  const [captions, setCaptions] = useState<Caption[]>([])

  const handleVideoUpload = (video: VideoFile) => {
    setVideoFile(video)
    setCurrentStep('edit')
  }

  const handleBackToUpload = () => {
    setCurrentStep('upload')
    setVideoFile(null)
    setCaptions([])
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
          onBack={handleBackToUpload}
        />
      )}
      
      <Toaster />
    </div>
  )
}

export default App