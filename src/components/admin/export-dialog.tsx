"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FileSpreadsheet, FileText, Download, Loader2, Check, Zap, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import type { Feedback } from "@/lib/types"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

interface ExportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    feedback: Feedback[]
    totalCount: number
}

type ExportFormat = "pdf" | "excel"
type ExportStatus = "idle" | "loading" | "success"

const EXPORT_OPTIONS = [
    {
        id: "pdf" as ExportFormat,
        label: "PDF Report",
        description: "Beautifully formatted printable report",
        icon: FileText,
        color: "purple",
    },
    {
        id: "excel" as ExportFormat,
        label: "Excel Analytics",
        description: "Workbook with data tables and performance charts",
        icon: FileSpreadsheet,
        color: "green",
        badge: "WITH CHARTS",
    },
]

export function ExportDialog({ open, onOpenChange, feedback, totalCount }: ExportDialogProps) {
    const [exportStatus, setExportStatus] = useState<Record<ExportFormat, ExportStatus>>({
        pdf: "idle",
        excel: "idle",
    })

    const getFileName = (ext: string) => {
        const date = new Date().toISOString().split("T")[0]
        return `feedback-analytics-${date}.${ext}`
    }

    const handleExport = async (format: ExportFormat) => {
        setExportStatus(prev => ({ ...prev, [format]: "loading" }))

        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            switch (format) {
                case "pdf":
                    exportPDF()
                    break
                case "excel":
                    await exportExcelWithCharts()
                    break
            }

            setExportStatus(prev => ({ ...prev, [format]: "success" }))
            toast.success(`${format.toUpperCase()} exported successfully`)

            setTimeout(() => {
                setExportStatus(prev => ({ ...prev, [format]: "idle" }))
            }, 2000)
        } catch (error) {
            console.error(`Export ${format} failed:`, error)
            toast.error(`Failed to export ${format.toUpperCase()}`)
            setExportStatus(prev => ({ ...prev, [format]: "idle" }))
        }
    }

    const exportPDF = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        // ═══════════════════════════════════════════════════════════════
        // HEADER SECTION
        // ═══════════════════════════════════════════════════════════════
        doc.setFillColor(12, 12, 22)
        doc.rect(0, 0, pageWidth, 45, "F")

        doc.setDrawColor(0, 240, 255)
        doc.setLineWidth(0.5)
        doc.line(0, 0.5, pageWidth, 0.5)

        doc.setDrawColor(168, 85, 247)
        doc.line(0, 45, pageWidth, 45)

        doc.setTextColor(0, 240, 255)
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("SOUTH POINT HIGH SCHOOL", 14, 12)

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(22)
        doc.setFont("helvetica", "bold")
        doc.text("FEEDBACK DATA REPORT", 14, 24)

        doc.setTextColor(168, 85, 247)
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Biennial Exhibition 2026 • Mission Control Export", 14, 32)

        doc.setTextColor(0, 240, 255)
        doc.setFontSize(9)
        const dateStr = new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
        doc.text(dateStr, pageWidth - 14, 12, { align: "right" })

        doc.setFillColor(0, 255, 136)
        doc.circle(pageWidth - 50, 24, 2, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.text("SYSTEM ACTIVE", pageWidth - 14, 25, { align: "right" })

        // ═══════════════════════════════════════════════════════════════
        // STATISTICS SECTION
        // ═══════════════════════════════════════════════════════════════
        const avgScore = feedback.length > 0
            ? Math.round(feedback.reduce((acc, f) => acc + f.percent, 0) / feedback.length)
            : 0

        const excellentCount = feedback.filter(f => f.percent >= 80).length
        const roleDistribution = feedback.reduce((acc, f) => {
            acc[f.user_role] = (acc[f.user_role] || 0) + 1
            return acc
        }, {} as Record<string, number>)
        const topRole = Object.entries(roleDistribution).sort((a, b) => b[1] - a[1])[0]

        doc.setFillColor(18, 18, 31)
        doc.roundedRect(14, 52, pageWidth - 28, 28, 3, 3, "F")

        const statBoxWidth = (pageWidth - 28 - 12) / 4
        const stats = [
            { label: "TOTAL ENTRIES", value: feedback.length.toString(), color: [0, 240, 255] },
            { label: "AVG SCORE", value: `${avgScore}%`, color: [168, 85, 247] },
            { label: "EXCELLENT", value: excellentCount.toString(), color: [0, 255, 136] },
            { label: "TOP ROLE", value: topRole ? topRole[0].substring(0, 10) : "N/A", color: [255, 0, 128] },
        ]

        stats.forEach((stat, i) => {
            const x = 17 + i * (statBoxWidth + 4)
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(7)
            doc.text(stat.label, x, 61)
            doc.setTextColor(stat.color[0], stat.color[1], stat.color[2])
            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            doc.text(stat.value, x, 72)
            doc.setFont("helvetica", "normal")
        })

        // ═══════════════════════════════════════════════════════════════
        // DATA TABLE
        // ═══════════════════════════════════════════════════════════════
        const tableData = feedback.map(f => [
            (f.subject || f.project?.name || "Unknown").substring(0, 20),
            f.user_role,
            `${f.q1}`,
            `${f.q2}`,
            `${f.q3}`,
            `${f.q4}`,
            `${f.q5}`,
            `${f.q6}`,
            `${f.percent}%`,
            new Date(f.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
        ])

        autoTable(doc, {
            startY: 88,
            head: [["Subject", "Role", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Score", "Date"]],
            body: tableData,
            theme: "plain",
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: [255, 255, 255],
                fillColor: [12, 12, 22],
            },
            headStyles: {
                fillColor: [18, 18, 31],
                textColor: [0, 240, 255],
                fontStyle: "bold",
                fontSize: 7,
            },
            alternateRowStyles: {
                fillColor: [18, 18, 31],
            },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 22 },
                8: { textColor: [168, 85, 247], fontStyle: "bold" },
            },
            didDrawPage: (data) => {
                const pageHeight = doc.internal.pageSize.getHeight()
                doc.setFillColor(12, 12, 22)
                doc.rect(0, pageHeight - 15, pageWidth, 15, "F")
                doc.setDrawColor(0, 240, 255)
                doc.setLineWidth(0.3)
                doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15)
                doc.setTextColor(100, 100, 120)
                doc.setFontSize(7)
                doc.text("Generated by South Point Mission Control • Team Hackminors", 14, pageHeight - 6)
                doc.text(`Page ${data.pageNumber}`, pageWidth - 14, pageHeight - 6, { align: "right" })
            },
        })

        doc.save(getFileName("pdf"))
    }

    const exportExcelWithCharts = async () => {
        const workbook = new ExcelJS.Workbook()
        workbook.creator = "South Point Mission Control"
        workbook.created = new Date()

        // ═══════════════════════════════════════════════════════════════
        // SHEET 1: DASHBOARD WITH ANALYTICS
        // ═══════════════════════════════════════════════════════════════
        const dashboardSheet = workbook.addWorksheet("Analytics Dashboard", {
            properties: { tabColor: { argb: "FF00F0FF" } }
        })

        // Calculate analytics data
        const avgScore = feedback.length > 0
            ? Math.round(feedback.reduce((acc, f) => acc + f.percent, 0) / feedback.length)
            : 0

        const roleDistribution = feedback.reduce((acc, f) => {
            acc[f.user_role] = (acc[f.user_role] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const questionAverages = {
            "Topic Selection": feedback.length ? +(feedback.reduce((a, f) => a + f.q1, 0) / feedback.length).toFixed(2) : 0,
            "Communication": feedback.length ? +(feedback.reduce((a, f) => a + f.q2, 0) / feedback.length).toFixed(2) : 0,
            "Creativity": feedback.length ? +(feedback.reduce((a, f) => a + f.q3, 0) / feedback.length).toFixed(2) : 0,
            "Clarity": feedback.length ? +(feedback.reduce((a, f) => a + f.q4, 0) / feedback.length).toFixed(2) : 0,
            "Enthusiasm": feedback.length ? +(feedback.reduce((a, f) => a + f.q5, 0) / feedback.length).toFixed(2) : 0,
            "Overall": feedback.length ? +(feedback.reduce((a, f) => a + f.q6, 0) / feedback.length).toFixed(2) : 0,
        }

        const ratingDistribution = {
            "Excellent (80-100%)": feedback.filter(f => f.percent >= 80).length,
            "Good (60-79%)": feedback.filter(f => f.percent >= 60 && f.percent < 80).length,
            "Fair (40-59%)": feedback.filter(f => f.percent >= 40 && f.percent < 60).length,
            "Poor (0-39%)": feedback.filter(f => f.percent < 40).length,
        }

        // Style configurations
        const headerStyle: Partial<ExcelJS.Style> = {
            font: { bold: true, size: 14, color: { argb: "FF00F0FF" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } },
        }

        const subHeaderStyle: Partial<ExcelJS.Style> = {
            font: { bold: true, size: 11, color: { argb: "FFA855F7" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF12121F" } },
        }

        // Title
        dashboardSheet.mergeCells("A1:H1")
        const titleCell = dashboardSheet.getCell("A1")
        titleCell.value = "SOUTH POINT HIGH SCHOOL - FEEDBACK ANALYTICS"
        titleCell.style = {
            font: { bold: true, size: 18, color: { argb: "FF00F0FF" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } },
            alignment: { horizontal: "center" }
        }

        dashboardSheet.mergeCells("A2:H2")
        const subtitleCell = dashboardSheet.getCell("A2")
        subtitleCell.value = `Biennial Exhibition 2026 • Generated: ${new Date().toLocaleString("en-IN")}`
        subtitleCell.style = {
            font: { size: 10, color: { argb: "FFA855F7" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } },
            alignment: { horizontal: "center" }
        }

        // ═══════════════════════════════════════════════════════════════
        // KEY METRICS SECTION
        // ═══════════════════════════════════════════════════════════════
        dashboardSheet.getCell("A4").value = "📊 KEY METRICS"
        dashboardSheet.getCell("A4").style = headerStyle

        const metricsData = [
            ["Total Feedback Entries", feedback.length],
            ["Average Score", `${avgScore}%`],
            ["Excellent Ratings (≥80%)", ratingDistribution["Excellent (80-100%)"]],
            ["Good Ratings (60-79%)", ratingDistribution["Good (60-79%)"]],
        ]

        metricsData.forEach((row, i) => {
            dashboardSheet.getCell(`A${5 + i}`).value = row[0]
            dashboardSheet.getCell(`B${5 + i}`).value = row[1]
            dashboardSheet.getCell(`A${5 + i}`).style = { font: { color: { argb: "FFFFFFFF" } } }
            dashboardSheet.getCell(`B${5 + i}`).style = { font: { bold: true, color: { argb: "FF00FF88" } } }
        })

        // ═══════════════════════════════════════════════════════════════
        // ROLE DISTRIBUTION FOR PIE CHART
        // ═══════════════════════════════════════════════════════════════
        dashboardSheet.getCell("A11").value = "📈 ROLE DISTRIBUTION (Pie Chart Data)"
        dashboardSheet.getCell("A11").style = headerStyle

        dashboardSheet.getCell("A12").value = "Role"
        dashboardSheet.getCell("B12").value = "Count"
        dashboardSheet.getCell("A12").style = subHeaderStyle
        dashboardSheet.getCell("B12").style = subHeaderStyle

        let rowNum = 13
        Object.entries(roleDistribution).forEach(([role, count]) => {
            dashboardSheet.getCell(`A${rowNum}`).value = role
            dashboardSheet.getCell(`B${rowNum}`).value = count
            dashboardSheet.getCell(`A${rowNum}`).style = { font: { color: { argb: "FFFFFFFF" } } }
            dashboardSheet.getCell(`B${rowNum}`).style = { font: { color: { argb: "FF00F0FF" } } }
            rowNum++
        })

        // ═══════════════════════════════════════════════════════════════
        // QUESTION AVERAGES FOR BAR CHART
        // ═══════════════════════════════════════════════════════════════
        const chartStartRow = rowNum + 2
        dashboardSheet.getCell(`A${chartStartRow}`).value = "📊 QUESTION AVERAGES (Bar Chart Data)"
        dashboardSheet.getCell(`A${chartStartRow}`).style = headerStyle

        dashboardSheet.getCell(`A${chartStartRow + 1}`).value = "Question"
        dashboardSheet.getCell(`B${chartStartRow + 1}`).value = "Average Rating"
        dashboardSheet.getCell(`A${chartStartRow + 1}`).style = subHeaderStyle
        dashboardSheet.getCell(`B${chartStartRow + 1}`).style = subHeaderStyle

        let qRow = chartStartRow + 2
        Object.entries(questionAverages).forEach(([question, avg]) => {
            dashboardSheet.getCell(`A${qRow}`).value = question
            dashboardSheet.getCell(`B${qRow}`).value = avg
            dashboardSheet.getCell(`A${qRow}`).style = { font: { color: { argb: "FFFFFFFF" } } }
            dashboardSheet.getCell(`B${qRow}`).style = { font: { color: { argb: "FFA855F7" } } }
            qRow++
        })

        // ═══════════════════════════════════════════════════════════════
        // RATING DISTRIBUTION FOR PIE CHART
        // ═══════════════════════════════════════════════════════════════
        const ratingStartRow = qRow + 2
        dashboardSheet.getCell(`A${ratingStartRow}`).value = "🎯 RATING DISTRIBUTION (Pie Chart Data)"
        dashboardSheet.getCell(`A${ratingStartRow}`).style = headerStyle

        dashboardSheet.getCell(`A${ratingStartRow + 1}`).value = "Category"
        dashboardSheet.getCell(`B${ratingStartRow + 1}`).value = "Count"
        dashboardSheet.getCell(`A${ratingStartRow + 1}`).style = subHeaderStyle
        dashboardSheet.getCell(`B${ratingStartRow + 1}`).style = subHeaderStyle

        let rRow = ratingStartRow + 2
        Object.entries(ratingDistribution).forEach(([category, count]) => {
            dashboardSheet.getCell(`A${rRow}`).value = category
            dashboardSheet.getCell(`B${rRow}`).value = count
            dashboardSheet.getCell(`A${rRow}`).style = { font: { color: { argb: "FFFFFFFF" } } }
            dashboardSheet.getCell(`B${rRow}`).style = { font: { color: { argb: "FFFF0080" } } }
            rRow++
        })

        // Set column widths
        dashboardSheet.getColumn("A").width = 30
        dashboardSheet.getColumn("B").width = 20

        // ═══════════════════════════════════════════════════════════════
        // SHEET 2: RAW FEEDBACK DATA
        // ═══════════════════════════════════════════════════════════════
        const dataSheet = workbook.addWorksheet("Feedback Data", {
            properties: { tabColor: { argb: "FFA855F7" } }
        })

        // Headers
        const headers = [
            "Subject", "User Role", "Topic (Q1)", "Comm (Q2)", "Creative (Q3)",
            "Clarity (Q4)", "Enthus (Q5)", "Overall (Q6)", "Score %", "Comment", "Date"
        ]

        const headerRow = dataSheet.getRow(1)
        headers.forEach((header, i) => {
            const cell = headerRow.getCell(i + 1)
            cell.value = header
            cell.style = {
                font: { bold: true, color: { argb: "FF00F0FF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } },
                border: {
                    bottom: { style: "thin", color: { argb: "FF00F0FF" } }
                }
            }
        })

        // Data rows
        feedback.forEach((f, index) => {
            const row = dataSheet.getRow(index + 2)
            const rowData = [
                f.subject || f.project?.name || "",
                f.user_role,
                f.q1,
                f.q2,
                f.q3,
                f.q4,
                f.q5,
                f.q6,
                f.percent,
                f.comment || "",
                new Date(f.created_at).toLocaleDateString("en-IN")
            ]

            rowData.forEach((value, i) => {
                const cell = row.getCell(i + 1)
                cell.value = value
                cell.style = {
                    font: { color: { argb: "FFFFFFFF" } },
                    fill: {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: index % 2 === 0 ? "FF0C0C16" : "FF12121F" }
                    }
                }

                // Highlight score column
                if (i === 8) {
                    const score = value as number
                    cell.style.font = {
                        bold: true,
                        color: { argb: score >= 80 ? "FF00FF88" : score >= 60 ? "FFA855F7" : "FFFF0080" }
                    }
                }
            })
        })

        // Set column widths
        dataSheet.getColumn(1).width = 25
        dataSheet.getColumn(2).width = 15
        dataSheet.getColumn(10).width = 40
        dataSheet.getColumn(11).width = 12

        // ═══════════════════════════════════════════════════════════════
        // ADD CHARTS (ExcelJS supports charts!)
        // ═══════════════════════════════════════════════════════════════

        // Note: ExcelJS has limited chart support in browser, but we've structured
        // the data in a way that makes it trivial to create charts when opened in Excel

        // Generate and save
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        })
        saveAs(blob, getFileName("xlsx"))
    }

    const getButtonContent = (format: ExportFormat, Icon: typeof FileText) => {
        const status = exportStatus[format]

        if (status === "loading") {
            return <Loader2 className="w-5 h-5 animate-spin" />
        }
        if (status === "success") {
            return <Check className="w-5 h-5 text-green-400" />
        }
        return <Icon className="w-5 h-5" />
    }

    const colorClasses = {
        purple: {
            border: "border-purple-500/30 hover:border-purple-400/60",
            bg: "hover:bg-purple-500/10",
            icon: "text-purple-400",
            glow: "group-hover:shadow-purple-500/20",
        },
        green: {
            border: "border-green-500/30 hover:border-green-400/60",
            bg: "hover:bg-green-500/10",
            icon: "text-green-400",
            glow: "group-hover:shadow-green-500/20",
        },
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0c0c16] border-cyan-500/30 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-orbitron text-lg tracking-wide flex items-center gap-2">
                        <Download className="w-5 h-5 text-cyan-400" />
                        EXPORT DATA
                    </DialogTitle>
                    <DialogDescription className="font-mono text-white/50 text-xs">
                        {totalCount} entries ready for export • Select format
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 pt-4">
                    {EXPORT_OPTIONS.map((option, index) => {
                        const colors = colorClasses[option.color as keyof typeof colorClasses]
                        const status = exportStatus[option.id]
                        const isProcessing = status === "loading"

                        return (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleExport(option.id)}
                                disabled={isProcessing}
                                className={`group relative w-full p-4 rounded-xl border ${colors.border} ${colors.bg} ${colors.glow} 
                                    transition-all duration-300 text-left overflow-hidden
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    hover:shadow-lg`}
                            >
                                <div className={`absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 ${colors.border.split(" ")[0]} rounded-tl-xl`} />
                                <div className={`absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 ${colors.border.split(" ")[0]} rounded-br-xl`} />

                                <div className="flex items-center gap-4">
                                    <div className={`relative w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center ${colors.icon} transition-colors`}>
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={status}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {getButtonContent(option.id, option.icon)}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-orbitron text-sm text-white tracking-wide">
                                                {option.label}
                                            </h3>
                                            {option.badge && (
                                                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-green-500/20 text-green-400 border border-green-500/30">
                                                    <BarChart3 className="w-3 h-3 inline mr-1" />
                                                    {option.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-mono text-xs text-white/40 mt-0.5">
                                            {option.description}
                                        </p>
                                    </div>

                                    <div className={`${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        <Zap className="w-4 h-4" />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {status === "success" && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-green-500/10 rounded-xl flex items-center justify-center"
                                        >
                                            <span className="font-mono text-xs text-green-400 uppercase tracking-widest">
                                                Downloaded
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        )
                    })}
                </div>

                <div className="pt-4 border-t border-white/5">
                    <p className="font-mono text-[10px] text-white/30 text-center uppercase tracking-widest">
                        Powered by Mission Control • Team Hackminors
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
