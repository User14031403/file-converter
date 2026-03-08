import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Upload,
  X,
  FileText,
  Image,
  Music,
  Video,
  Archive,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "sonner";

type FileType = "document" | "image" | "audio" | "video" | "archive";

interface ConversionFile {
  id: string;
  file: File;
  type: FileType;
  status: "pending" | "converting" | "completed" | "error";
  progress: number;
  error?: string;
  outputUrl?: string;
}

const CONVERSION_OPTIONS: Record<FileType, { from: string[]; to: string[] }> = {
  document: {
    from: ["docx", "pdf"],
    to: ["pdf", "docx"],
  },
  image: {
    from: ["jpeg", "jpg", "png", "svg"],
    to: ["jpeg", "png", "svg"],
  },
  audio: {
    from: ["mp3", "wav"],
    to: ["mp3", "wav"],
  },
  video: {
    from: ["mp4", "mov"],
    to: ["mp4", "mov"],
  },
  archive: {
    from: ["zip"],
    to: ["zip"],
  },
};

export default function Converter() {
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<Record<string, string>>({});
  const [isConverting, setIsConverting] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const convertMutation = trpc.conversion.convert.useMutation();

  const getFileType = (file: File): FileType | null => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext) return null;

    for (const [type, options] of Object.entries(CONVERSION_OPTIONS)) {
      if (options.from.includes(ext)) {
        return type as FileType;
      }
    }
    return null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.add("border-accent", "bg-accent/5");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove("border-accent", "bg-accent/5");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove("border-accent", "bg-accent/5");
    }

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList: File[]) => {
    const newFiles: ConversionFile[] = fileList
      .map((file) => {
        const type = getFileType(file);
        if (!type) {
          toast.error(`${file.name} is not a supported file type`);
          return null;
        }

        return {
          id: Math.random().toString(36),
          file,
          type,
          status: "pending" as const,
          progress: 0,
        };
      })
      .filter((f) => f !== null) as ConversionFile[];

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleConvert = async () => {
    const filesToConvert = files.filter((f) => f.status === "pending");

    if (filesToConvert.length === 0) {
      toast.error("Please add files to convert");
      return;
    }

    const invalidFiles = filesToConvert.filter((f) => !selectedFormat[f.id]);
    if (invalidFiles.length > 0) {
      toast.error("Please select output format for all files");
      return;
    }

    setIsConverting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of filesToConvert) {
      const outputFormat = selectedFormat[file.id];

      // Update status to converting
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: "converting" as const, progress: 5 } : f
        )
      );

      try {
        // Read file as buffer
        const arrayBuffer = await file.file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Simulate initial progress
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress: 25 } : f))
        );

        // Call backend API
        const result = await convertMutation.mutateAsync({
          fileName: file.file.name,
          fileBuffer: buffer,
          outputFormat: outputFormat,
        });

        // Update progress to 75%
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress: 75 } : f))
        );

        // Simulate final progress
        await new Promise((resolve) => setTimeout(resolve, 200));
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress: 100 } : f))
        );

        // Update to completed
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "completed" as const,
                  progress: 100,
                  outputUrl: result.downloadUrl,
                }
              : f
          )
        );

        successCount++;
        toast.success(`${file.file.name} converted successfully`);
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : "Conversion failed";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "error" as const,
                  error: errorMessage,
                }
              : f
          )
        );
        toast.error(`Failed to convert ${file.file.name}: ${errorMessage}`);
      }
    }

    setIsConverting(false);
    
    // Show summary
    if (successCount > 0 && errorCount === 0) {
      toast.success(`Successfully converted ${successCount} file(s)`);
    } else if (errorCount > 0 && successCount > 0) {
      toast.info(`Converted ${successCount} file(s), ${errorCount} failed`);
    }
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case "document":
        return <FileText className="w-5 h-5" />;
      case "image":
        return <Image className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "archive":
        return <Archive className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-12">
      <div className="container max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">File Converter</h1>
            <p className="text-lg text-muted-foreground">
              Upload your files and convert them to your desired format
            </p>
          </div>

          {/* Upload Area */}
          <div
            ref={dragRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed border-border rounded-2xl p-12 text-center space-y-4 transition-all cursor-pointer hover:border-accent/50"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Drop files here or click to upload
              </h3>
              <p className="text-muted-foreground">
                Supported: DOCX, PDF, JPEG, PNG, SVG, MP3, WAV, MP4, MOV, ZIP
              </p>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              accept=".docx,.pdf,.jpeg,.jpg,.png,.svg,.mp3,.wav,.mp4,.mov,.zip"
            />
            <label htmlFor="file-input">
              <Button variant="outline" asChild>
                <span>Select Files</span>
              </Button>
            </label>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Files to Convert ({files.length})
              </h2>

              <div className="space-y-3">
                {files.map((file) => {
                  const currentFormat = file.file.name.split(".").pop()?.toLowerCase() || "";
                  const availableFormats = CONVERSION_OPTIONS[file.type].to.filter(
                    (f) => f !== currentFormat
                  );

                  return (
                    <Card
                      key={file.id}
                      className="p-4 space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {file.file.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.file.size)}
                            </p>
                          </div>
                        </div>

                        {file.status === "pending" && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <select
                              value={selectedFormat[file.id] || ""}
                              onChange={(e) =>
                                setSelectedFormat((prev) => ({
                                  ...prev,
                                  [file.id]: e.target.value,
                                }))
                              }
                              className="input-elegant text-sm"
                            >
                              <option value="">Select format</option>
                              {availableFormats.map((fmt) => (
                                <option key={fmt} value={fmt}>
                                  {fmt.toUpperCase()}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              disabled={isConverting}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        {file.status === "converting" && (
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">
                              {file.progress}%
                            </span>
                          </div>
                        )}

                        {file.status === "completed" && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            {file.outputUrl && (
                              <a href={file.outputUrl} download>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Download className="w-4 h-4" />
                                  Download
                                </Button>
                              </a>
                            )}
                          </div>
                        )}

                        {file.status === "error" && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex flex-col items-end gap-1">
                              <AlertCircle className="w-5 h-5 text-destructive" />
                              <span className="text-xs text-destructive max-w-xs text-right">
                                {file.error}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFiles((prev) =>
                                  prev.map((f) =>
                                    f.id === file.id
                                      ? { ...f, status: "pending" as const, error: undefined }
                                      : f
                                  )
                                );
                              }}
                            >
                              Retry
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Convert Button */}
              {files.some((f) => f.status === "pending") && (
                <Button
                  onClick={handleConvert}
                  disabled={isConverting}
                  size="lg"
                  className="w-full gap-2"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      Convert Files
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Empty State */}
          {files.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No files selected. Upload files to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
