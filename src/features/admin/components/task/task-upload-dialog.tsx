import { useState, useRef, useCallback } from 'react'
import { Upload, FileJson, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetGroups } from '../../api/group'
import { useCreateTasksBulk } from '../../api/task'
import { useUIStore } from '@/store/use-ui-store'
import type { TaskUploadPayload } from '@/types'

interface TaskUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type UploadState = 'idle' | 'validating' | 'uploading' | 'success' | 'error'

interface ValidationResult {
  valid: boolean
  payload: TaskUploadPayload | null
  errors: string[]
}

export function TaskUploadDialog({ open, onOpenChange }: TaskUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [groupId, setGroupId] = useState<string>('')
  const [batchName, setBatchName] = useState<string>('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<{ created: number; failed: number } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useUIStore()
  const { data: groups, isLoading: groupsLoading } = useGetGroups()
  const createTasksBulk = useCreateTasksBulk()

  const resetState = useCallback(() => {
    setSelectedFile(null)
    setGroupId('')
    setBatchName('')
    setUploadState('idle')
    setValidationResult(null)
    setUploadProgress(0)
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleClose = useCallback((open: boolean) => {
    if (!open) {
      resetState()
    }
    onOpenChange(open)
  }, [onOpenChange, resetState])

  const validateJsonPayload = (data: unknown): ValidationResult => {
    const errors: string[] = []

    if (!data || typeof data !== 'object') {
      return { valid: false, payload: null, errors: ['Invalid JSON structure'] }
    }

    const payload = data as Record<string, unknown>

    if (!Array.isArray(payload.data)) {
      errors.push('Missing or invalid "data" array')
      return { valid: false, payload: null, errors }
    }

    if (payload.data.length === 0) {
      errors.push('Data array is empty')
      return { valid: false, payload: null, errors }
    }

    // Validate each item
    payload.data.forEach((item: unknown, index: number) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Item ${index + 1}: Invalid structure`)
        return
      }

      const taskItem = item as Record<string, unknown>

      if (!taskItem.image_url || typeof taskItem.image_url !== 'string') {
        errors.push(`Item ${index + 1}: Missing or invalid "image_url"`)
      } else {
        try {
          new URL(taskItem.image_url as string)
        } catch {
          errors.push(`Item ${index + 1}: Invalid URL format for "image_url"`)
        }
      }

      if (!taskItem.transcription || typeof taskItem.transcription !== 'string') {
        errors.push(`Item ${index + 1}: Missing or invalid "transcription"`)
      }
    })

    if (errors.length > 0) {
      return { valid: false, payload: null, errors }
    }

    return {
      valid: true,
      payload: payload as unknown as TaskUploadPayload,
      errors: [],
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setUploadState('validating')
    setValidationResult(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const result = validateJsonPayload(data)
      setValidationResult(result)
      setUploadState(result.valid ? 'idle' : 'error')
    } catch {
      setValidationResult({
        valid: false,
        payload: null,
        errors: ['Failed to parse JSON file. Please ensure it is valid JSON.'],
      })
      setUploadState('error')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/json') {
      const event = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(event)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleUpload = async () => {
    if (!validationResult?.payload || !groupId || !batchName.trim()) return

    setUploadState('uploading')
    setUploadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 100)

    try {
      const result = await createTasksBulk.mutateAsync({
        payload: validationResult.payload,
        groupId,
        batchName: batchName.trim(),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadResult({ created: result.created, failed: result.failed })
      setUploadState('success')

      addToast({
        title: 'Tasks uploaded',
        description: `Successfully created ${result.created} task(s)${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        variant: result.failed > 0 ? 'default' : 'success',
      })
    } catch (error) {
      clearInterval(progressInterval)
      setUploadState('error')
      setValidationResult({
        valid: false,
        payload: null,
        errors: ['Upload failed. Please try again.'],
      })
      addToast({
        title: 'Upload failed',
        description: 'Failed to upload tasks. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const canUpload = validationResult?.valid && groupId && batchName.trim() && uploadState !== 'uploading'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Tasks
          </DialogTitle>
          <DialogDescription>
            Upload a JSON file containing tasks to create. Select a group to assign them to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Batch Name */}
          <div className="space-y-2">
            <Label htmlFor="batchName">Batch Name</Label>
            <Input
              id="batchName"
              placeholder="Enter batch name..."
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              disabled={uploadState === 'uploading' || uploadState === 'success'}
            />
          </div>

          {/* Group Selection */}
          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select
              value={groupId}
              onValueChange={setGroupId}
              disabled={groupsLoading || uploadState === 'uploading' || uploadState === 'success'}
            >
              <SelectTrigger id="group">
                <SelectValue placeholder="Select a group..." />
              </SelectTrigger>
              <SelectContent>
                {groups?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Zone */}
          {uploadState !== 'success' && (
            <div className="space-y-2">
              <Label>JSON File</Label>
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
                  ${uploadState === 'error' ? 'border-destructive/50 bg-destructive/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploadState === 'uploading'}
                />

                <div className="flex flex-col items-center gap-2 text-center">
                  {selectedFile ? (
                    <>
                      <FileJson className="h-10 w-10 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {validationResult?.valid && (
                        <p className="text-xs text-success flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {validationResult.payload?.data.length} items found
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Drop JSON file here or click to browse</p>
                        <p className="text-xs text-muted-foreground">
                          Supports .json files
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationResult && !validationResult.valid && validationResult.errors.length > 0 && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 space-y-1">
              <p className="text-sm font-medium text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Validation Errors
              </p>
              <ul className="text-xs text-destructive/80 list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                {validationResult.errors.slice(0, 10).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
                {validationResult.errors.length > 10 && (
                  <li>...and {validationResult.errors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}

          {/* Upload Progress */}
          {uploadState === 'uploading' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success State */}
          {uploadState === 'success' && uploadResult && (
            <div className="rounded-lg border border-success/50 bg-success/5 p-4 text-center space-y-2">
              <CheckCircle className="h-10 w-10 text-success mx-auto" />
              <p className="text-sm font-medium text-success">Upload Complete!</p>
              <p className="text-xs text-muted-foreground">
                Created {uploadResult.created} task(s)
                {uploadResult.failed > 0 && `, ${uploadResult.failed} failed`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4">
          {uploadState === 'success' ? (
            <Button onClick={() => handleClose(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!canUpload}>
                {uploadState === 'uploading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Tasks
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

