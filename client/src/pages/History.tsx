import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Download,
  Trash2,
  FileText,
  Image,
  Music,
  Video,
  Archive,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface ConversionRecord {
  id: string;
  fileName: string;
  originalFormat: string;
  outputFormat: string;
  fileSize: number;
  convertedAt: Date;
  type: "document" | "image" | "audio" | "video" | "archive";
  downloadUrl: string;
}

const FILE_TYPE_MAP: Record<string, ConversionRecord["type"]> = {
  document: "document",
  image: "image",
  audio: "audio",
  video: "video",
  archive: "archive",
};

export default function History() {
  const { data: conversions = [], isLoading } = trpc.conversion.getHistory.useQuery({
    limit: 100,
  });
  const deleteConversionMutation = trpc.conversion.deleteConversion.useMutation();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const history: ConversionRecord[] = conversions.map((c) => ({
    id: c.id.toString(),
    fileName: c.originalFileName,
    originalFormat: c.originalFormat.toUpperCase(),
    outputFormat: c.outputFormat.toUpperCase(),
    fileSize: c.originalFileSize,
    convertedAt: new Date(c.createdAt),
    type: FILE_TYPE_MAP[c.fileType] || "document",
    downloadUrl: c.convertedFileUrl || "#",
  }));

  const getFileIcon = (type: string) => {
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
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConversionMutation.mutateAsync({
        id: parseInt(id),
      });
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast.success("Conversion deleted");
    } catch (error) {
      toast.error("Failed to delete conversion");
    }
  };

  const handleDownload = (record: ConversionRecord) => {
    if (record.downloadUrl && record.downloadUrl !== "#") {
      window.open(record.downloadUrl, "_blank");
    } else {
      toast.error("Download link not available");
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === history.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(history.map((item) => item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    try {
      const ids = Array.from(selectedItems);
      for (const id of ids) {
        await deleteConversionMutation.mutateAsync({
          id: parseInt(id),
        });
      }
      setSelectedItems(new Set());
      toast.success("Selected conversions deleted");
    } catch (error) {
      toast.error("Failed to delete conversions");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-12">
        <div className="container max-w-5xl">
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Conversion History</h1>
              <p className="text-lg text-muted-foreground">
                Loading your conversions...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-12">
      <div className="container max-w-5xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Conversion History</h1>
            <p className="text-lg text-muted-foreground">
              View and manage your previous file conversions
            </p>
          </div>

          {history.length === 0 ? (
            /* Empty State */
            <Card className="p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Archive className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  No conversions yet
                </h3>
                <p className="text-muted-foreground">
                  Your conversion history will appear here
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* Toolbar */}
              {selectedItems.size > 0 && (
                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <span className="text-sm font-medium text-foreground">
                    {selectedItems.size} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}

              {/* History Table */}
              <div className="space-y-3">
                {/* Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-lg text-sm font-semibold text-muted-foreground">
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === history.length && history.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </div>
                  <div className="col-span-4">File Name</div>
                  <div className="col-span-2">Format</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {/* Rows */}
                {history.map((record) => (
                  <Card
                    key={record.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Checkbox */}
                      <div className="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(record.id)}
                          onChange={() => handleSelectItem(record.id)}
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                      </div>

                      {/* File Info */}
                      <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                          {getFileIcon(record.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">
                            {record.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                          </p>
                        </div>
                      </div>

                      {/* Format */}
                      <div className="col-span-1 md:col-span-2">
                        <p className="text-sm text-foreground">
                          {record.originalFormat} → {record.outputFormat}
                        </p>
                      </div>

                      {/* Size */}
                      <div className="col-span-1 md:col-span-2">
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(record.fileSize)}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(record.convertedAt)}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(record)}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-6 space-y-2">
                  <p className="text-sm text-muted-foreground">Total Conversions</p>
                  <p className="text-3xl font-bold text-foreground">{history.length}</p>
                </Card>
                <Card className="p-6 space-y-2">
                  <p className="text-sm text-muted-foreground">Total Size</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatFileSize(
                      history.reduce((sum, item) => sum + item.fileSize, 0)
                    )}
                  </p>
                </Card>
                <Card className="p-6 space-y-2">
                  <p className="text-sm text-muted-foreground">Most Recent</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatDate(history[0].convertedAt)}
                  </p>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
