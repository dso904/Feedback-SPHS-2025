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
                    await exportPDF()
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

    const exportPDF = async () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()

        // ═══════════════════════════════════════════════════════════════
        // CALCULATE ANALYTICS DATA
        // ═══════════════════════════════════════════════════════════════
        const avgScore = feedback.length > 0
            ? Math.round(feedback.reduce((acc, f) => acc + f.percent, 0) / feedback.length)
            : 0

        const excellentCount = feedback.filter(f => f.percent >= 80).length
        const goodCount = feedback.filter(f => f.percent >= 60 && f.percent < 80).length
        const fairCount = feedback.filter(f => f.percent >= 40 && f.percent < 60).length
        const poorCount = feedback.filter(f => f.percent < 40).length

        const roleDistribution = feedback.reduce((acc, f) => {
            acc[f.user_role] = (acc[f.user_role] || 0) + 1
            return acc
        }, {} as Record<string, number>)
        const topRole = Object.entries(roleDistribution).sort((a, b) => b[1] - a[1])[0]

        const questionAverages = {
            "Q1": feedback.length ? +(feedback.reduce((a, f) => a + f.q1, 0) / feedback.length).toFixed(1) : 0,
            "Q2": feedback.length ? +(feedback.reduce((a, f) => a + f.q2, 0) / feedback.length).toFixed(1) : 0,
            "Q3": feedback.length ? +(feedback.reduce((a, f) => a + f.q3, 0) / feedback.length).toFixed(1) : 0,
            "Q4": feedback.length ? +(feedback.reduce((a, f) => a + f.q4, 0) / feedback.length).toFixed(1) : 0,
            "Q5": feedback.length ? +(feedback.reduce((a, f) => a + f.q5, 0) / feedback.length).toFixed(1) : 0,
            "Q6": feedback.length ? +(feedback.reduce((a, f) => a + f.q6, 0) / feedback.length).toFixed(1) : 0,
        }

        // ═══════════════════════════════════════════════════════════════
        // FETCH CHART IMAGES
        // ═══════════════════════════════════════════════════════════════
        let roleChartBase64 = ""
        let ratingChartBase64 = ""
        let barChartBase64 = ""

        try {
            const roleConfig = {
                type: 'doughnut',
                data: {
                    labels: Object.keys(roleDistribution),
                    datasets: [{
                        data: Object.values(roleDistribution),
                        backgroundColor: ['#00f0ff', '#a855f7', '#ff0080', '#00ff88', '#ff6b00']
                    }]
                },
                options: {
                    plugins: {
                        legend: { position: 'right', labels: { color: '#fff', font: { size: 11 } } },
                        title: { display: true, text: 'User Roles', color: '#00f0ff', font: { size: 14 } }
                    }
                }
            }

            const ratingConfig = {
                type: 'pie',
                data: {
                    labels: ['Excellent', 'Good', 'Fair', 'Poor'],
                    datasets: [{
                        data: [excellentCount, goodCount, fairCount, poorCount],
                        backgroundColor: ['#00ff88', '#a855f7', '#ff6b00', '#ff0080']
                    }]
                },
                options: {
                    plugins: {
                        legend: { position: 'right', labels: { color: '#fff', font: { size: 11 } } },
                        title: { display: true, text: 'Performance', color: '#00ff88', font: { size: 14 } }
                    }
                }
            }

            const barConfig = {
                type: 'bar',
                data: {
                    labels: Object.keys(questionAverages),
                    datasets: [{
                        label: 'Avg Rating',
                        data: Object.values(questionAverages),
                        backgroundColor: ['#00f0ff', '#a855f7', '#ff0080', '#00ff88', '#ff6b00', '#00f0ff']
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, max: 5, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                        x: { ticks: { color: '#fff' }, grid: { display: false } }
                    },
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Question Averages', color: '#a855f7', font: { size: 14 } }
                    }
                }
            }

            const fetchChart = async (config: object) => {
                const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&backgroundColor=rgb(12,12,22)&width=300&height=200`
                const res = await fetch(url)
                const blob = await res.blob()
                return new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result as string)
                    reader.readAsDataURL(blob)
                })
            }

            roleChartBase64 = await fetchChart(roleConfig)
            ratingChartBase64 = await fetchChart(ratingConfig)
            barChartBase64 = await fetchChart(barConfig)
        } catch (error) {
            console.error("Chart generation failed:", error)
        }

        // ═══════════════════════════════════════════════════════════════
        // PAGE 1: COVER & SUMMARY
        // ═══════════════════════════════════════════════════════════════

        // Full page dark background
        doc.setFillColor(12, 12, 22)
        doc.rect(0, 0, pageWidth, pageHeight, "F")

        // Top neon line
        doc.setDrawColor(0, 240, 255)
        doc.setLineWidth(1)
        doc.line(0, 2, pageWidth, 2)

        // Corner brackets - top left
        doc.setDrawColor(0, 240, 255)
        doc.setLineWidth(0.5)
        doc.line(10, 10, 10, 25)
        doc.line(10, 10, 25, 10)

        // Corner brackets - top right
        doc.line(pageWidth - 10, 10, pageWidth - 10, 25)
        doc.line(pageWidth - 10, 10, pageWidth - 25, 10)

        // Header text
        doc.setTextColor(0, 240, 255)
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("SOUTH POINT HIGH SCHOOL", 14, 35)

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(28)
        doc.setFont("helvetica", "bold")
        doc.text("FEEDBACK ANALYTICS", 14, 50)

        doc.setTextColor(168, 85, 247)
        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")
        doc.text("MISSION CONTROL REPORT", 14, 60)

        // Status indicator
        doc.setFillColor(0, 255, 136)
        doc.circle(pageWidth - 20, 40, 3, "F")
        doc.setTextColor(0, 255, 136)
        doc.setFontSize(8)
        doc.text("LIVE DATA", pageWidth - 14, 42, { align: "right" })

        // Date
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(9)
        const dateStr = new Date().toLocaleDateString("en-IN", {
            year: "numeric", month: "long", day: "numeric"
        })
        doc.text(dateStr, pageWidth - 14, 52, { align: "right" })

        // Divider line
        doc.setDrawColor(168, 85, 247)
        doc.setLineWidth(0.3)
        doc.line(14, 70, pageWidth - 14, 70)

        // ═══════════════════════════════════════════════════════════════
        // STATISTICS CARDS
        // ═══════════════════════════════════════════════════════════════
        const cardWidth = 42
        const cardHeight = 28
        const cardY = 78
        const cardGap = 4
        const startX = 14

        const statsCards = [
            { label: "TOTAL ENTRIES", value: feedback.length.toString(), color: [0, 240, 255] },
            { label: "AVG SCORE", value: `${avgScore}%`, color: [168, 85, 247] },
            { label: "EXCELLENT", value: excellentCount.toString(), color: [0, 255, 136] },
            { label: "TOP ROLE", value: topRole ? topRole[0].substring(0, 8) : "N/A", color: [255, 0, 128] },
        ]

        statsCards.forEach((card, i) => {
            const x = startX + i * (cardWidth + cardGap)

            // Card background
            doc.setFillColor(18, 18, 31)
            doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "F")

            // Top border accent
            doc.setDrawColor(card.color[0], card.color[1], card.color[2])
            doc.setLineWidth(1)
            doc.line(x + 2, cardY, x + cardWidth - 2, cardY)

            // Label
            doc.setTextColor(150, 150, 170)
            doc.setFontSize(6)
            doc.setFont("helvetica", "normal")
            doc.text(card.label, x + 4, cardY + 10)

            // Value
            doc.setTextColor(card.color[0], card.color[1], card.color[2])
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.text(card.value, x + 4, cardY + 22)
        })

        // ═══════════════════════════════════════════════════════════════
        // CHARTS SECTION
        // ═══════════════════════════════════════════════════════════════
        const chartY = 115

        // Section title
        doc.setTextColor(0, 240, 255)
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("◆ VISUAL ANALYTICS", 14, chartY)

        // Charts row
        if (roleChartBase64) {
            doc.addImage(roleChartBase64, "PNG", 14, chartY + 5, 58, 45)
        }
        if (ratingChartBase64) {
            doc.addImage(ratingChartBase64, "PNG", 76, chartY + 5, 58, 45)
        }
        if (barChartBase64) {
            doc.addImage(barChartBase64, "PNG", 138, chartY + 5, 58, 45)
        }

        // ═══════════════════════════════════════════════════════════════
        // FOOTER - Page 1
        // ═══════════════════════════════════════════════════════════════
        // Bottom neon line
        doc.setDrawColor(168, 85, 247)
        doc.setLineWidth(0.5)
        doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20)

        // Corner brackets - bottom
        doc.setDrawColor(168, 85, 247)
        doc.line(10, pageHeight - 10, 10, pageHeight - 25)
        doc.line(10, pageHeight - 10, 25, pageHeight - 10)
        doc.line(pageWidth - 10, pageHeight - 10, pageWidth - 10, pageHeight - 25)
        doc.line(pageWidth - 10, pageHeight - 10, pageWidth - 25, pageHeight - 10)

        doc.setTextColor(100, 100, 130)
        doc.setFontSize(7)
        doc.setFont("helvetica", "normal")
        doc.text("Generated by South Point Mission Control • Team Hackminors", 14, pageHeight - 10)
        doc.text("Page 1", pageWidth - 14, pageHeight - 10, { align: "right" })

        // ═══════════════════════════════════════════════════════════════
        // PAGE 2+: DATA TABLE
        // ═══════════════════════════════════════════════════════════════
        doc.addPage()

        const tableData = feedback.map(f => [
            (f.subject || f.project?.name || "Unknown").substring(0, 18),
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
            startY: 20,
            head: [["Subject", "Role", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Score", "Date"]],
            body: tableData,
            theme: "plain",
            styles: {
                fontSize: 7,
                cellPadding: 2.5,
                textColor: [220, 220, 230],
                fillColor: [12, 12, 22],
                lineColor: [30, 30, 50],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [18, 18, 40],
                textColor: [0, 240, 255],
                fontStyle: "bold",
                fontSize: 7,
                halign: "center",
            },
            alternateRowStyles: {
                fillColor: [16, 16, 28],
            },
            columnStyles: {
                0: { cellWidth: 32 },
                1: { cellWidth: 18 },
                2: { halign: "center", cellWidth: 10 },
                3: { halign: "center", cellWidth: 10 },
                4: { halign: "center", cellWidth: 10 },
                5: { halign: "center", cellWidth: 10 },
                6: { halign: "center", cellWidth: 10 },
                7: { halign: "center", cellWidth: 10 },
                8: { halign: "center", cellWidth: 16, fontStyle: "bold" },
                9: { cellWidth: 20 },
            },
            didParseCell: (data) => {
                // Color code Score column
                if (data.column.index === 8 && data.section === "body") {
                    const val = parseInt(data.cell.text[0])
                    if (val >= 80) data.cell.styles.textColor = [0, 255, 136]
                    else if (val >= 60) data.cell.styles.textColor = [168, 85, 247]
                    else if (val >= 40) data.cell.styles.textColor = [255, 107, 0]
                    else data.cell.styles.textColor = [255, 0, 128]
                }
            },
            didDrawPage: (data) => {
                const currentPageHeight = doc.internal.pageSize.getHeight()
                const currentPageWidth = doc.internal.pageSize.getWidth()

                // Dark background for new pages
                doc.setFillColor(12, 12, 22)
                doc.rect(0, 0, currentPageWidth, 15, "F")

                // Top line
                doc.setDrawColor(0, 240, 255)
                doc.setLineWidth(0.5)
                doc.line(0, 1, currentPageWidth, 1)

                // Header on table pages
                doc.setTextColor(0, 240, 255)
                doc.setFontSize(8)
                doc.setFont("helvetica", "bold")
                doc.text("FEEDBACK DATA REPORT", 14, 10)
                doc.setTextColor(168, 85, 247)
                doc.setFontSize(7)
                doc.setFont("helvetica", "normal")
                doc.text("Continued...", currentPageWidth - 14, 10, { align: "right" })

                // Footer
                doc.setFillColor(12, 12, 22)
                doc.rect(0, currentPageHeight - 12, currentPageWidth, 12, "F")
                doc.setDrawColor(168, 85, 247)
                doc.setLineWidth(0.3)
                doc.line(14, currentPageHeight - 12, currentPageWidth - 14, currentPageHeight - 12)
                doc.setTextColor(100, 100, 130)
                doc.setFontSize(6)
                doc.text("South Point Mission Control • Biennial Exhibition 2026", 14, currentPageHeight - 5)
                doc.text(`Page ${data.pageNumber + 1}`, currentPageWidth - 14, currentPageHeight - 5, { align: "right" })
            },
        })

        doc.save(getFileName("pdf"))
    }

    // Helper to fetch chart image
    const fetchChartImage = async (config: any) => {
        const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&bkg=transparent`
        const res = await fetch(url)
        return await res.arrayBuffer()
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
            dashboardSheet.getCell(`A${5 + i}`).style = {
                font: { color: { argb: "FFFFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } }
            }
            dashboardSheet.getCell(`B${5 + i}`).style = {
                font: { bold: true, color: { argb: "FF00FF88" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } }
            }
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
            dashboardSheet.getCell(`A${rowNum}`).style = {
                font: { color: { argb: "FFFFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } }
            }
            dashboardSheet.getCell(`B${rowNum}`).style = {
                font: { color: { argb: "FF00F0FF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } }
            }
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
            dashboardSheet.getCell(`A${qRow}`).style = {
                font: { color: { argb: "FFFFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } }
            }
            dashboardSheet.getCell(`B${qRow}`).style = {
                font: { color: { argb: "FFA855F7" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } }
            }
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
            dashboardSheet.getCell(`A${rRow}`).style = {
                font: { color: { argb: "FFFFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } }
            }
            dashboardSheet.getCell(`B${rRow}`).style = {
                font: { color: { argb: "FFFF0080" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C0C16" } }
            }
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
        // ADD CHARTS
        // ═══════════════════════════════════════════════════════════════

        // 1. Role Distribution Chart
        const roleConfig = {
            type: 'doughnut',
            data: {
                labels: Object.keys(roleDistribution),
                datasets: [{
                    data: Object.values(roleDistribution),
                    backgroundColor: ['#00f0ff', '#a855f7', '#ff0080', '#00ff88', '#ff6b00'],
                    borderColor: '#12121f',
                    borderWidth: 2
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'right', labels: { font: { size: 14, family: 'Arial' }, color: 'white' } },
                    title: { display: true, text: 'User Role Distribution', font: { size: 18, family: 'Arial' }, color: '#00f0ff' }
                }
            }
        }

        // 2. Question Averages Chart
        const qConfig = {
            type: 'bar',
            data: {
                labels: Object.keys(questionAverages),
                datasets: [{
                    label: 'Average Rating (1-5)',
                    data: Object.values(questionAverages),
                    backgroundColor: 'rgba(168, 85, 247, 0.8)',
                    borderColor: '#a855f7',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, max: 5, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } },
                    x: { grid: { display: false }, ticks: { color: 'white' } }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Average Ratings by Question', font: { size: 18, family: 'Arial' }, color: '#a855f7' }
                }
            }
        }

        // 3. Rating Distribution Chart
        const ratingConfig = {
            type: 'pie',
            data: {
                labels: Object.keys(ratingDistribution),
                datasets: [{
                    data: Object.values(ratingDistribution),
                    backgroundColor: ['#00ff88', '#a855f7', '#ff0080', '#ff6b00'],
                    borderColor: '#12121f',
                    borderWidth: 2
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'right', labels: { font: { size: 14, family: 'Arial' }, color: 'white' } },
                    title: { display: true, text: 'Performance Distribution', font: { size: 18, family: 'Arial' }, color: '#00ff88' }
                }
            }
        }

        try {
            const roleImage = await fetchChartImage(roleConfig)
            const qImage = await fetchChartImage(qConfig)
            const ratingImage = await fetchChartImage(ratingConfig)

            const roleImageId = workbook.addImage({ buffer: roleImage, extension: 'png' })
            const qImageId = workbook.addImage({ buffer: qImage, extension: 'png' })
            const ratingImageId = workbook.addImage({ buffer: ratingImage, extension: 'png' })

            // Place charts
            dashboardSheet.addImage(roleImageId, {
                tl: { col: 3, row: 11 }, // D12
                ext: { width: 400, height: 250 }
            })

            dashboardSheet.addImage(qImageId, {
                tl: { col: 3, row: rowNum + 3 },
                ext: { width: 400, height: 250 }
            })

            dashboardSheet.addImage(ratingImageId, {
                tl: { col: 3, row: ratingStartRow + 1 },
                ext: { width: 400, height: 250 }
            })

        } catch (error) {
            console.error("Failed to generate charts:", error)
            // Continue without charts
        }

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
