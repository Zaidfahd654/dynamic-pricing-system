import React, { useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CSVUploader({ onDataParsed }) {
  const inputRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return null;

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s/g, ""));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map((v) => v.trim());
      const row = {};
      header.forEach((h, idx) => {
        row[h] = vals[idx] || "";
      });
      rows.push(row);
    }

    // Normalize column names
    return rows.map((r) => ({
      date: r.date || r.Date || "",
      product_name: r.product || r.Product || r.product_name || "",
      price: parseFloat(r.price || r.Price || 0),
      units_sold: parseInt(r.unitssold || r.units_sold || r.UnitsSold || r.sold || 0),
    })).filter((r) => r.date && r.product_name && !isNaN(r.price));
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      if (parsed && parsed.length > 0) {
        onDataParsed(parsed, file.name);
      } else {
        alert("Could not parse CSV. Make sure columns are: Date, Product, Price, UnitsSold");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Upload className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-bold text-foreground text-lg mb-1">Upload Sales CSV</h3>
      <p className="text-sm text-muted-foreground mb-4">Drag & drop or click to browse</p>
      <Button variant="outline" size="sm" className="gap-2" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
        <FileText className="h-4 w-4" />
        Choose File
      </Button>
      <div className="mt-6 bg-muted/50 rounded-xl p-4 text-left max-w-sm mx-auto">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Expected CSV format:</p>
        <code className="text-xs text-foreground leading-relaxed whitespace-pre">
          {`Date,Product,Price,UnitsSold\n2024-01-01,Shoes,1200,40\n2024-01-02,Shoes,1200,35`}
        </code>
      </div>
    </div>
  );
}