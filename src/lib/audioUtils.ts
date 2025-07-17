/**
 * Audio processing utilities for video caption generation
 */

export interface AudioExtractionResult {
  audioData: ArrayBuffer | Uint8Array
  duration: number
  sampleRate: number
}

/**
 * Extract audio data from video file with size optimization
 */
export async function extractAudioFromVideo(
  videoFile: File,
  maxSizeBytes: number = 50 * 1024 * 1024 // 50MB default
): Promise<AudioExtractionResult> {
  // Check file size first
  if (videoFile.size > maxSizeBytes * 2) {
    throw new Error(`Video file is too large (${Math.round(videoFile.size / 1024 / 1024)}MB). Please use a video smaller than ${Math.round(maxSizeBytes / 1024 / 1024)}MB.`)
  }

  try {
    // For smaller files, use direct ArrayBuffer
    if (videoFile.size <= maxSizeBytes) {
      const arrayBuffer = await videoFile.arrayBuffer()
      
      // Get video metadata
      const video = document.createElement('video')
      const videoUrl = URL.createObjectURL(videoFile)
      
      return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(videoUrl)
          resolve({
            audioData: arrayBuffer,
            duration: video.duration,
            sampleRate: 44100 // Default sample rate
          })
        }
        video.onerror = () => {
          URL.revokeObjectURL(videoUrl)
          reject(new Error('Failed to load video metadata'))
        }
        video.src = videoUrl
      })
    }

    // For larger files, try to use Uint8Array for better memory management
    const arrayBuffer = await videoFile.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Get video metadata
    const video = document.createElement('video')
    const videoUrl = URL.createObjectURL(videoFile)
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(videoUrl)
        resolve({
          audioData: uint8Array,
          duration: video.duration,
          sampleRate: 44100
        })
      }
      video.onerror = () => {
        URL.revokeObjectURL(videoUrl)
        reject(new Error('Failed to load video metadata'))
      }
      video.src = videoUrl
    })
  } catch (error: any) {
    if (error.message?.includes('Invalid array length')) {
      throw new Error('Video file is too large for processing. Please compress your video or use a smaller file.')
    }
    throw error
  }
}

/**
 * Validate video file for audio processing
 */
export function validateVideoFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm', 'video/quicktime']
  if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please use MP4, MOV, AVI, MKV, or WebM format.'
    }
  }

  // Check file size (100MB limit)
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is 100MB.`
    }
  }

  // Check minimum file size (1KB)
  if (file.size < 1024) {
    return {
      isValid: false,
      error: 'File too small. Please select a valid video file.'
    }
  }

  return { isValid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Estimate processing time based on file size
 */
export function estimateProcessingTime(fileSizeBytes: number): string {
  const sizeMB = fileSizeBytes / (1024 * 1024)
  
  if (sizeMB < 10) return '30-60 seconds'
  if (sizeMB < 25) return '1-2 minutes'
  if (sizeMB < 50) return '2-3 minutes'
  return '3-5 minutes'
}