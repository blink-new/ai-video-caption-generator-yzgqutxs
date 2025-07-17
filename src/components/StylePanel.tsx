import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Caption } from '@/App'

interface StylePanelProps {
  captions: Caption[]
  setCaptions: React.Dispatch<React.SetStateAction<Caption[]>>
  selectedCaption: string | null
}

const StylePanel: React.FC<StylePanelProps> = ({
  captions,
  setCaptions,
  selectedCaption
}) => {
  const currentCaption = captions.find(cap => cap.id === selectedCaption)

  const updateCaptionStyle = (updates: Partial<Caption['style']>) => {
    if (!selectedCaption) return
    
    setCaptions(prev => prev.map(caption => 
      caption.id === selectedCaption
        ? { ...caption, style: { ...caption.style, ...updates } }
        : caption
    ))
  }

  const updateCaptionText = (text: string) => {
    if (!selectedCaption) return
    
    setCaptions(prev => prev.map(caption => 
      caption.id === selectedCaption
        ? { ...caption, text }
        : caption
    ))
  }

  const applyToAllCaptions = () => {
    if (!currentCaption) return
    
    setCaptions(prev => prev.map(caption => ({
      ...caption,
      style: { ...currentCaption.style }
    })))
  }

  const colorPresets = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Yellow', value: '#FEF08A' },
    { name: 'Blue', value: '#93C5FD' },
    { name: 'Green', value: '#86EFAC' },
    { name: 'Red', value: '#FCA5A5' },
    { name: 'Purple', value: '#C4B5FD' },
    { name: 'Orange', value: '#FDBA74' }
  ]

  const backgroundPresets = [
    { name: 'Transparent', value: 'transparent' },
    { name: 'Black', value: 'rgba(0, 0, 0, 0.7)' },
    { name: 'White', value: 'rgba(255, 255, 255, 0.9)' },
    { name: 'Dark Blue', value: 'rgba(30, 58, 138, 0.8)' },
    { name: 'Dark Green', value: 'rgba(20, 83, 45, 0.8)' },
    { name: 'Dark Red', value: 'rgba(153, 27, 27, 0.8)' }
  ]

  const fontOptions = [
    'Inter',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact'
  ]

  if (!currentCaption) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p className="mb-2">No caption selected</p>
              <p className="text-sm">
                Click on a caption in the timeline to edit its style
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Caption Text */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Caption Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="caption-text">Text</Label>
            <Textarea
              id="caption-text"
              value={currentCaption.text}
              onChange={(e) => updateCaptionText(e.target.value)}
              placeholder="Enter caption text..."
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="font-family">Font Family</Label>
            <Select
              value={currentCaption.style.fontFamily}
              onValueChange={(value) => updateCaptionStyle({ fontFamily: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map(font => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="font-size">
              Font Size: {currentCaption.style.fontSize}px
            </Label>
            <Slider
              id="font-size"
              min={12}
              max={72}
              step={2}
              value={[currentCaption.style.fontSize]}
              onValueChange={([value]) => updateCaptionStyle({ fontSize: value })}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Text Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorPresets.map(color => (
                <button
                  key={color.name}
                  className={`w-full h-8 rounded border-2 transition-all ${
                    currentCaption.style.color === color.value
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => updateCaptionStyle({ color: color.value })}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Background</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {backgroundPresets.map(bg => (
                <button
                  key={bg.name}
                  className={`w-full h-8 rounded border-2 transition-all text-xs font-medium ${
                    currentCaption.style.backgroundColor === bg.value
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ 
                    backgroundColor: bg.value === 'transparent' ? '#f3f4f6' : bg.value,
                    color: bg.value === 'transparent' ? '#374151' : '#ffffff'
                  }}
                  onClick={() => updateCaptionStyle({ backgroundColor: bg.value })}
                >
                  {bg.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Vertical Position</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: 'Top', value: 'top' as const },
                { label: 'Center', value: 'center' as const },
                { label: 'Bottom', value: 'bottom' as const }
              ].map(position => (
                <button
                  key={position.value}
                  className={`px-3 py-2 text-sm font-medium rounded border transition-all ${
                    currentCaption.style.position === position.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => updateCaptionStyle({ position: position.value })}
                >
                  {position.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apply to All */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Style</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={applyToAllCaptions}
            className="w-full"
            variant="outline"
          >
            Apply to All Captions
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
            <div
              className="px-4 py-2 rounded-lg max-w-full text-center"
              style={{
                fontSize: `${currentCaption.style.fontSize}px`,
                color: currentCaption.style.color,
                backgroundColor: currentCaption.style.backgroundColor,
                fontFamily: currentCaption.style.fontFamily,
                fontWeight: 600,
                lineHeight: 1.2,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
              }}
            >
              {currentCaption.text}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StylePanel