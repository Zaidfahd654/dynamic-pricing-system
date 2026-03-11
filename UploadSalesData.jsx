import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import CSVUploader from "../components/upload/CSVUploader";
import UploadAnalysis from "../components/upload/UploadAnalysis";

export default function UploadSalesData() {
  const [uploadedData, setUploadedData] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleDataParsed = (data, name) => {
    setUploadedData(data);
    setFileName(name);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Sales Data</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your own CSV dataset — the system will analyze trends, forecast demand, and suggest optimal pricing
          </p>
        </div>
        {uploadedData && (
          <Button variant="outline" className="gap-2" onClick={() => { setUploadedData(null); setFileName(""); }}>
            <RefreshCw className="h-4 w-4" />
            Upload New File
          </Button>
        )}
      </div>

      {!uploadedData ? (
        <CSVUploader onDataParsed={handleDataParsed} />
      ) : (
        <UploadAnalysis data={uploadedData} fileName={fileName} />
      )}
    </div>
  );
}