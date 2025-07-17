import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Video, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { VideoFile } from '@/App'

interface VideoUploadProps {
  onVideoUpload: (video: VideoFile) => void
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoUpload }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Create video URL and get duration
      const videoUrl = URL.createObjectURL(file)
      const video = document.createElement('video')
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          setUploadProgress(100)
          setTimeout(() => {
            onVideoUpload({
              file,
              url: videoUrl,
              duration: video.duration
            })
            setUploading(false)
            resolve(video.duration)
          }, 500)
        }
        video.onerror = () => reject(new Error('Failed to load video'))
        video.src = videoUrl
      })
    } catch (err) {
      setError('Failed to process video file. Please try again.')
      setUploading(false)
      setUploadProgress(0)
    }
  }, [onVideoUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    maxFiles: 1,
    disabled: uploading
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Video className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Video Caption Generator
          </h1>
          <p className="text-lg text-gray-600">
            Upload your video and let AI generate engaging captions automatically
          </p>
        </div>

        {/* Upload Area */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`text-center cursor-pointer transition-all duration-200 ${
                isDragActive ? 'scale-105' : ''
              } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-full ${
                  isDragActive ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  <Upload className={`h-12 w-12 ${
                    isDragActive ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                </div>
                
                <div>
                  <p className="text-xl font-medium text-gray-900 mb-2">
                    {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
                  </p>
                  <p className="text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <Button variant="outline" disabled={uploading}>
                    Choose Video File
                  </Button>
                </div>
                
                <div className="text-sm text-gray-400">
                  Supports MP4, MOV, AVI, MKV, WebM • Max 500MB
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Processing video...
                  </span>
                  <span className="text-sm text-gray-500">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="bg-amber-100 p-2 rounded-full w-fit mx-auto mb-2">
              <Video className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Automatic caption generation using advanced AI
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="bg-green-100 p-2 rounded-full w-fit mx-auto mb-2">
              <Upload className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Easy Upload</h3>
            <p className="text-sm text-gray-600">
              Drag & drop or click to upload your videos
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="bg-blue-100 p-2 rounded-full w-fit mx-auto mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Customizable</h3>
            <p className="text-sm text-gray-600">
              Style and position captions to match your brand
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoUpload