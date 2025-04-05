
import { useState, useRef } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Mic, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useTheme } from "@/components/theme-provider"

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [smartSuggestions, setSmartSuggestions] = useState(true)
  const [autoCategorizeTasks, setAutoCategorizeTasks] = useState(true)
  const [voiceInput, setVoiceInput] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  )

  // Test voice recognition
  const testVoiceRecognition = () => {
    if (!isVoiceSupported) {
      toast.error("Voice recognition is not supported in your browser")
      return
    }

    setIsRecording(true)
    
    // Get SpeechRecognition constructor
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
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
      
      // Safety timeout
      setTimeout(() => {
        if (isRecording) {
          recognition.stop()
          setIsRecording(false)
        }
      }, 10000)
    }
  }

  const clearAllData = () => {
    // This would clear all data from Supabase in a real app
    toast.success("All data has been cleared")
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how TaskPro looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Select a theme for the application
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={theme === "light" ? "default" : "outline"} 
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "default" : "outline"} 
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </Button>
                  <Button 
                    variant={theme === "system" ? "default" : "outline"} 
                    onClick={() => setTheme("system")}
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smart Features</CardTitle>
              <CardDescription>
                Control the intelligent features of TaskPro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smart-suggestions">Smart Suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    Suggest due dates and priorities based on task title
                  </p>
                </div>
                <Switch
                  id="smart-suggestions"
                  checked={smartSuggestions}
                  onCheckedChange={setSmartSuggestions}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-categorize">Auto-Categorize Tasks</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign tasks to projects based on keywords
                  </p>
                </div>
                <Switch
                  id="auto-categorize"
                  checked={autoCategorizeTasks}
                  onCheckedChange={setAutoCategorizeTasks}
                />
              </div>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your TaskPro data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Clear All Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Delete all tasks, projects, and settings
                  </p>
                </div>
                <Button variant="destructive" onClick={clearAllData}>
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
