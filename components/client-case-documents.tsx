import { format } from "date-fns"
import { FileText, Download, Eye } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ClientCaseDocumentsProps {
  caseData: any
}

export function ClientCaseDocuments({ caseData }: ClientCaseDocumentsProps) {
  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "LEASE_AGREEMENT":
        return "bg-blue-50 text-blue-700"
      case "NOTICE":
        return "bg-amber-50 text-amber-700"
      case "COURT_FILING":
        return "bg-purple-50 text-purple-700"
      case "CORRESPONDENCE":
        return "bg-green-50 text-green-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Documents related to your case</CardDescription>
      </CardHeader>
      <CardContent>
        {caseData.documents.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
            <div className="flex flex-col items-center gap-1 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-sm font-medium">No documents</h3>
              <p className="text-xs text-muted-foreground">No documents have been uploaded for this case</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {caseData.documents.map((document: any) => (
              <div key={document.id} className="flex items-center justify-between rounded-md border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{document.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className={getDocumentTypeColor(document.type)}>
                        {document.type.replace(/_/g, " ")}
                      </Badge>
                      <span>Uploaded {format(new Date(document.uploadedAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
