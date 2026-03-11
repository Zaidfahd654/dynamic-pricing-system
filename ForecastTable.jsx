import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ForecastTable({ forecastData }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Day</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Predicted Demand</TableHead>
            <TableHead className="font-semibold">Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forecastData.map((row, i) => {
            const prev = i > 0 ? forecastData[i - 1].predicted : row.predicted;
            const diff = row.predicted - prev;
            return (
              <TableRow key={i}>
                <TableCell className="font-medium">Day {i + 1}</TableCell>
                <TableCell className="text-muted-foreground">{row.dateLabel}</TableCell>
                <TableCell className="font-bold">{row.predicted} units</TableCell>
                <TableCell>
                  {i === 0 ? (
                    <Badge variant="secondary" className="text-xs">Baseline</Badge>
                  ) : diff > 0 ? (
                    <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">↑ +{diff}</Badge>
                  ) : diff < 0 ? (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">↓ {diff}</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">→ 0</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}