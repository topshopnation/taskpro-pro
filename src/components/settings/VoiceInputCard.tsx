
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Mic, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function VoiceInputCard() {
  const [voiceInput, setVoiceInput] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  )
  
  const testVoiceRecognition = () => {
    if (!isVoiceSupported) {
      toast.error("Voice recognition is not supported in your browser")
      return
    }

    setIsRecording(true)
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = false
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        toast.success(`Recognized: "${transcript}"`)
        setIsRecording(false)
      }
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        toast.error(`Error: ${event.error}`)
        setIsRecording(false)
      }
      
      recognition.onend = () => {
        setIsRecording(false)
      }
      
      recognition.start()
      
      setTimeout(() => {
        if (isRecording) {
          recognition.stop()
          setIsRecording(false)
        }
      }, 10000)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Input</CardTitle>
        <CardDescription>
          Configure voice input settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="voice-input">Enable Voice Input</Label>
            <p className="text-sm text-muted-foreground">
              Allow adding tasks using voice commands
            </p>
          </div>
          <Switch
            id="voice-input"
            checked={voiceInput}
            onCheckedChange={setVoiceInput}
            disabled={!isVoiceSupported}
          />
        </div>
        {!isVoiceSupported && (
          <p className="text-sm text-destructive">
            Voice input is not supported in your browser.
          </p>
        )}
        {isVoiceSupported && (
          <div className="mt-4">
            <Button onClick={testVoiceRecognition} disabled={isRecording}>
              {isRecording ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Test Voice Recognition
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
