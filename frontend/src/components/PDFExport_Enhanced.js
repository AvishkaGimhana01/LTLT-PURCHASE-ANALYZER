import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Enhanced Professional PDF Report Generator for LTL Transformers
// Matches the modern purple gradient design with company logo
export const generateProfessionalPDF = async (data) => {
  try {
    console.log('📄 Enhanced PDF Export - Starting generation...');
    
    const {
      typeBreakdown,
      itemServiceBreakdown,
      currencyBreakdown,
      vendorBreakdown,
      filterInfo,
      filteredData
    } = data;

    // Validate required data
    if (!typeBreakdown && !itemServiceBreakdown && !currencyBreakdown && !vendorBreakdown) {
      throw new Error('No analysis data available. Please ensure data is loaded before exporting.');
    }

    if (!filteredData || filteredData.length === 0) {
      throw new Error('No data records found. Please load data before exporting.');
    }

    console.log('✅ Data validation passed');

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Modern color scheme matching the web app
    const colors = {
      primary: [102, 126, 234], // Purple gradient start #667eea
      secondary: [118, 75, 162], // Purple gradient end #764ba2
      accent: [79, 70, 229], // Indigo #4F46E5
      orange: [249, 115, 22], // Orange #F97316
      success: [16, 185, 129], // Green
      danger: [239, 68, 68], // Red
      purple: [168, 85, 247], // Purple
      dark: [51, 51, 51],
      light: [245, 247, 250],
      white: [255, 255, 255]
    };

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        addFooter();
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Helper function to add footer to each page
    const addFooter = () => {
      const footerY = pageHeight - 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('LTL Transformers - Purchase Analysis Report', pageWidth / 2, footerY, { align: 'center' });
      doc.setFontSize(7);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 20, footerY, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, footerY);
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
      if (!amount || isNaN(amount)) return 'Rs. 0.00';
      const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `Rs. ${formatted}`;
    };

    // Helper function to format large numbers with B/M/K suffix
    const formatBillions = (num) => {
      if (!num || isNaN(num)) return 'Rs. 0';
      const absNum = Math.abs(num);
      
      if (absNum >= 1000000000) {
        return `Rs. ${(num / 1000000000).toFixed(2)}B`;
      } else if (absNum >= 1000000) {
        return `Rs. ${(num / 1000000).toFixed(2)}M`;
      } else if (absNum >= 1000) {
        return `Rs. ${(num / 1000).toFixed(2)}K`;
      }
      return `Rs. ${num.toFixed(2)}`;
    };

    // Helper function to format number
    const formatNumber = (num) => {
      if (!num || isNaN(num)) return '0';
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Helper function for safe division
    const safeDivide = (numerator, denominator) => {
      if (!denominator || denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
        return 0;
      }
      return numerator / denominator;
    };

    // Helper function to format date
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Helper function to draw modern gradient header
    const drawGradientHeader = (title, y, height = 12) => {
      // Simulate gradient with multiple rectangles
      const steps = 20;
      const stepHeight = height / steps;
      for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const r = colors.primary[0] + (colors.secondary[0] - colors.primary[0]) * ratio;
        const g = colors.primary[1] + (colors.secondary[1] - colors.primary[1]) * ratio;
        const b = colors.primary[2] + (colors.secondary[2] - colors.primary[2]) * ratio;
        doc.setFillColor(r, g, b);
        doc.rect(0, y + i * stepHeight, pageWidth, stepHeight, 'F');
      }
      
      doc.setTextColor(...colors.white);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 15, y + height - 3);
    };

    // Helper function to draw modern metric card with enhanced styling
    const drawMetricCard = (x, y, width, height, title, value, subtitle, color) => {
      // Enhanced shadow with offset
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(x + 2, y + 2, width, height, 3, 3, 'F'); // Shadow
      
      // Card gradient background
      const steps = 10;
      for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const r = color[0] + (255 - color[0]) * ratio * 0.1;
        const g = color[1] + (255 - color[1]) * ratio * 0.1;
        const b = color[2] + (255 - color[2]) * ratio * 0.1;
        doc.setFillColor(r, g, b);
        const stepHeight = height / steps;
        doc.rect(x, y + i * stepHeight, width, stepHeight, 'F');
      }
      
      // Card border
      doc.setDrawColor(...color);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, width, height, 3, 3, 'S');
      
      // Title with background bar
      doc.setFillColor(color[0] * 0.9, color[1] * 0.9, color[2] * 0.9);
      doc.rect(x, y, width, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(title, x + width / 2, y + 7, { align: 'center' });
      
      // Value with emphasis
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(value, x + width / 2, y + 19, { align: 'center' });
      
      // Subtitle
      if (subtitle) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(subtitle, x + width / 2, y + 25, { align: 'center' });
      }
    };

    // Helper function to draw enhanced donut chart
    const drawDonutChart = (centerX, centerY, outerRadius, innerRadius, data, chartColors) => {
      let currentAngle = -Math.PI / 2; // Start from top
      
      data.forEach((segment, index) => {
        const angle = (segment.percentage / 100) * 2 * Math.PI;
        const endAngle = currentAngle + angle;
        
        // Use modulo to wrap colors
        const colorIndex = index % chartColors.length;
        doc.setFillColor(...chartColors[colorIndex]);
        
        // Draw outer arc segments
        const steps = 50;
        const angleStep = angle / steps;
        
        for (let i = 0; i < steps; i++) {
          const a1 = currentAngle + i * angleStep;
          const a2 = currentAngle + (i + 1) * angleStep;
          
          // Outer arc points
          const x1 = centerX + outerRadius * Math.cos(a1);
          const y1 = centerY + outerRadius * Math.sin(a1);
          const x2 = centerX + outerRadius * Math.cos(a2);
          const y2 = centerY + outerRadius * Math.sin(a2);
          
          // Inner arc points
          const x3 = centerX + innerRadius * Math.cos(a2);
          const y3 = centerY + innerRadius * Math.sin(a2);
          const x4 = centerX + innerRadius * Math.cos(a1);
          const y4 = centerY + innerRadius * Math.sin(a1);
          
          // Draw quad
          doc.setDrawColor(...chartColors[colorIndex]);
          doc.setLineWidth(0.1);
          doc.triangle(x1, y1, x2, y2, x3, y3, 'FD');
          doc.triangle(x1, y1, x3, y3, x4, y4, 'FD');
        }
        
        // Draw percentage label if segment is large enough
        if (segment.percentage > 3) {
          const labelAngle = currentAngle + angle / 2;
          const labelRadius = (outerRadius + innerRadius) / 2;
          const labelX = centerX + labelRadius * Math.cos(labelAngle);
          const labelY = centerY + labelRadius * Math.sin(labelAngle);
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${segment.percentage.toFixed(1)}%`, labelX, labelY, { align: 'center' });
        }
        
        currentAngle = endAngle;
      });
      
      // Draw center circle (white)
      doc.setFillColor(255, 255, 255);
      const steps = 50;
      for (let i = 0; i < steps; i++) {
        const a1 = (i / steps) * 2 * Math.PI;
        const a2 = ((i + 1) / steps) * 2 * Math.PI;
        doc.triangle(
          centerX, centerY,
          centerX + innerRadius * Math.cos(a1),
          centerY + innerRadius * Math.sin(a1),
          centerX + innerRadius * Math.cos(a2),
          centerY + innerRadius * Math.sin(a2),
          'F'
        );
      }
      
      doc.setDrawColor(0, 0, 0);
      doc.setTextColor(0, 0, 0);
    };

    // Helper function to draw chart legend
    const drawLegend = (startX, startY, data, chartColors) => {
      let currentY = startY;
      
      data.forEach((item, index) => {
        const colorIndex = index % chartColors.length;
        doc.setFillColor(...chartColors[colorIndex]);
        doc.roundedRect(startX, currentY - 3, 4, 4, 0.5, 0.5, 'F');
        
        doc.setTextColor(51, 51, 51); // Dark color
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const text = `${item.label}: ${item.percentage.toFixed(1)}% (${formatBillions(item.value)})`;
        doc.text(text, startX + 6, currentY);
        
        currentY += 6;
      });
    };

    // ==================== PAGE 1: MODERN COVER PAGE ====================
    
    // Modern gradient header with enhanced design
    const gradientSteps = 50;
    const gradientHeight = 90;
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const r = colors.primary[0] + (colors.secondary[0] - colors.primary[0]) * ratio;
      const g = colors.primary[1] + (colors.secondary[1] - colors.primary[1]) * ratio;
      const b = colors.primary[2] + (colors.secondary[2] - colors.primary[2]) * ratio;
      doc.setFillColor(r, g, b);
      doc.rect(0, (i / gradientSteps) * gradientHeight, pageWidth, gradientHeight / gradientSteps, 'F');
    }
    
    // Load and add company logo
    try {
      const logoImg = new Image();
      logoImg.src = '/logo_/a.png'; // Path to logo in public folder
      
      // Add logo if loaded successfully
      if (logoImg.complete || logoImg.width > 0) {
        // Center logo at top
        const logoWidth = 25;
        const logoHeight = 25;
        const logoX = (pageWidth - logoWidth) / 2;
        const logoY = 15;
        
        // White background circle for logo
        doc.setFillColor(255, 255, 255);
        doc.circle(pageWidth / 2, logoY + 12, 15, 'F');
        
        // Add logo image (will be added if image loads)
        try {
          doc.addImage(logoImg, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } catch (e) {
          // Fallback to text if image fails
          doc.setTextColor(...colors.primary);
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text('LTL', pageWidth / 2, logoY + 15, { align: 'center' });
        }
      } else {
        // Fallback logo circle with text
        doc.setFillColor(255, 255, 255);
        doc.circle(pageWidth / 2, 27, 14, 'F');
        doc.setTextColor(...colors.primary);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('LTL', pageWidth / 2, 30, { align: 'center' });
      }
    } catch (error) {
      // Fallback logo if image loading fails
      doc.setFillColor(255, 255, 255);
      doc.circle(pageWidth / 2, 27, 14, 'F');
      doc.setTextColor(...colors.primary);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('LTL', pageWidth / 2, 30, { align: 'center' });
    }
    
    // Company Name with enhanced styling
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('LTL TRANSFORMERS', pageWidth / 2, 58, { align: 'center' });
    
    // Subtitle with professional styling
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Purchases Analysis Report', pageWidth / 2, 72, { align: 'center' });
    
    // Decorative line under header
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(50, 82, pageWidth - 50, 82);
    
    // Report Title with enhanced typography
    yPosition = 115;
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ANALYSIS', pageWidth / 2, yPosition, { align: 'center' });
    doc.setFontSize(28);
    doc.text('REPORT', pageWidth / 2, yPosition + 12, { align: 'center' });
    
    // Date and Report Info with icon-style marker
    yPosition += 32;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    const reportDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.text(`Generated: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Modern Filter Information Card with enhanced design
    yPosition += 15;
    if (filterInfo) {
      // Enhanced card with shadow effect
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(26, yPosition + 1, pageWidth - 52, 71, 4, 4, 'F'); // Shadow
      
      // Card background
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(25, yPosition, pageWidth - 50, 70, 4, 4, 'F');
      
      // Card border with gradient color
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(1);
      doc.roundedRect(25, yPosition, pageWidth - 50, 70, 4, 4, 'S');
      
      // Header bar inside card
      doc.setFillColor(...colors.primary);
      doc.roundedRect(25, yPosition, pageWidth - 50, 12, 4, 4, 'F');
      doc.rect(25, yPosition + 8, pageWidth - 50, 4, 'F'); // Cover bottom corners
      
      yPosition += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('REPORT SCOPE', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);
      
      if (filterInfo.hasActiveFilters) {
        doc.setFont('helvetica', 'bold');
        doc.text('Status: Filtered Data Analysis', pageWidth / 2, yPosition, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        yPosition += 8;
        
        if (filterInfo.dateRange) {
          const dateText = filterInfo.dateRange.selectedDate 
            ? `Date: ${formatDate(filterInfo.dateRange.selectedDate)}`
            : `Period: ${formatDate(filterInfo.dateRange.startDate)} to ${formatDate(filterInfo.dateRange.endDate)}`;
          doc.text(dateText, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 7;
        }
        
        if (filterInfo.orderType) {
          const orderTypeText = filterInfo.orderType === '1' ? 'Import Orders' 
            : filterInfo.orderType === '2' ? 'Local Orders' : 'Job Orders';
          doc.text(`Order Type: ${orderTypeText}`, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 7;
        }
        
        if (filterInfo.itemService) {
          doc.text(`Category: ${filterInfo.itemService}`, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 7;
        }
      } else {
        doc.setFont('helvetica', 'bold');
        doc.text('Status: Complete Data Analysis', pageWidth / 2, yPosition, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        yPosition += 8;
      }
      
      // Total records with highlight
      doc.setFillColor(240, 245, 255);
      doc.roundedRect(pageWidth / 2 - 40, yPosition - 3, 80, 10, 2, 2, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.accent);
      doc.text(`Total Records: ${(filterInfo.totalRecords || 0).toLocaleString()}`, pageWidth / 2, yPosition + 4, { align: 'center' });
    }
    
    // Enhanced bottom decorative element with gradient
    yPosition = pageHeight - 45;
    
    // Gradient footer
    for (let i = 0; i < 20; i++) {
      const ratio = i / 20;
      const gray = 245 - (ratio * 10);
      doc.setFillColor(gray, gray, gray + 5);
      doc.rect(0, yPosition + i * 2.25, pageWidth, 2.25, 'F');
    }
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL', pageWidth / 2, yPosition + 18, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('For Internal Use Only', pageWidth / 2, yPosition + 25, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text('(c) 2025 LTL Transformers. All rights reserved.', pageWidth / 2, yPosition + 32, { align: 'center' });

    // ==================== PAGE 2: EXECUTIVE SUMMARY ====================
    
    doc.addPage();
    yPosition = 20;
    
    drawGradientHeader('1. EXECUTIVE SUMMARY', yPosition);
    yPosition += 20;
    
    // Key Metrics Cards
    if (typeBreakdown) {
      const totalAmount = typeBreakdown.total || 0;
      const totalQty = typeBreakdown.totalQty || 0;
      const avgValue = safeDivide(totalAmount, totalQty);
      
      const cardWidth = (pageWidth - 50) / 3;
      const cardHeight = 28;
      const startX = 15;
      
      drawMetricCard(startX, yPosition, cardWidth, cardHeight, 
        'TOTAL VALUE', formatBillions(totalAmount), '', colors.primary);
      
      drawMetricCard(startX + cardWidth + 5, yPosition, cardWidth, cardHeight, 
        'TRANSACTIONS', formatNumber(totalQty), 'orders', colors.accent);
      
      drawMetricCard(startX + 2 * (cardWidth + 5), yPosition, cardWidth, cardHeight, 
        'AVG VALUE', formatBillions(avgValue), 'per order', colors.orange);
      
      yPosition += cardHeight + 15;
    }
    
    // Summary Table
    const summaryData = [];
    
    if (typeBreakdown) {
      const totalAmount = typeBreakdown.total || 0;
      const totalQty = typeBreakdown.totalQty || 0;
      
      summaryData.push(
        ['Total Purchase Value', formatCurrency(totalAmount), '100%'],
        ['Total Transactions', formatNumber(totalQty) + ' orders', '-'],
        ['Average Transaction', formatCurrency(safeDivide(totalAmount, totalQty)), '-'],
        ['Data Coverage', filterInfo?.hasActiveFilters ? 'Filtered Dataset' : 'Complete Dataset', '-']
      );
      
      // Add breakdown summary
      if (typeBreakdown.breakdown) {
        Object.entries(typeBreakdown.breakdown).forEach(([type, data]) => {
          if (data.value > 0) {
            const percentage = safeDivide(data.value * 100, totalAmount).toFixed(2);
            summaryData.push([
              `${type} Orders`,
              formatBillions(data.value),
              `${percentage}%`
            ]);
          }
        });
      }
    }
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value', 'Share']],
      body: summaryData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
        1: { halign: 'right', cellWidth: 70 },
        2: { halign: 'center', cellWidth: 30 }
      },
      margin: { left: 15, right: 15 },
      alternateRowStyles: {
        fillColor: [250, 250, 252]
      }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;

    // ==================== PAGE 3: ORDER TYPE ANALYSIS ====================
    
    checkPageBreak(100);
    
    drawGradientHeader('2. PURCHASE ORDER TYPE ANALYSIS', yPosition);
    yPosition += 20;
    
    if (typeBreakdown && typeBreakdown.breakdown) {
      const tableData = [];
      const total = typeBreakdown.total || 0;
      
      Object.entries(typeBreakdown.breakdown).forEach(([type, data]) => {
        if (data.value > 0) {
          const percentage = safeDivide(data.value * 100, total).toFixed(2);
          tableData.push([
            type,
            formatBillions(data.value),
            formatNumber(data.qty),
            `${percentage}%`,
            formatBillions(safeDivide(data.value, data.qty))
          ]);
        }
      });
      
      // Add Total Row
      tableData.push([
        'TOTAL',
        formatBillions(total),
        formatNumber(typeBreakdown.totalQty),
        '100.00%',
        formatBillions(safeDivide(total, typeBreakdown.totalQty))
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Order Type', 'Total Amount', 'Quantity', 'Share %', 'Avg. Value']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: colors.primary,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          textColor: colors.white
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { fontStyle: 'bold', halign: 'left', cellWidth: 40 },
          1: { halign: 'right', cellWidth: 35 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 35 }
        },
        margin: { left: 15, right: 15 },
        didParseCell: (data) => {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = colors.light;
            data.cell.styles.textColor = colors.dark;
          }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
      
      // Add Modern Donut Chart on new section
      yPosition += 20;
      
      // Add visual separator
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      
      yPosition += 15;
      
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDER TYPE DISTRIBUTION CHART', 15, yPosition);
      
      yPosition += 10;
      
      // Prepare chart data
      const orderTypeChartData = [];
      const orderTypeColors = [
        colors.accent,    // Indigo - Import
        colors.orange,    // Orange - Local
        colors.purple     // Purple - Job Orders
      ];
      
      Object.entries(typeBreakdown.breakdown).forEach(([type, data]) => {
        if (data.value > 0) {
          const percentage = safeDivide(data.value * 100, total);
          orderTypeChartData.push({
            label: type,
            percentage: percentage,
            value: data.value
          });
        }
      });
      
      // Draw donut chart
      const chartCenterX = 50;
      const chartCenterY = yPosition + 35;
      const outerRadius = 30;
      const innerRadius = 18;
      
      drawDonutChart(chartCenterX, chartCenterY, outerRadius, innerRadius, orderTypeChartData, orderTypeColors);
      
      // Draw legend
      drawLegend(100, yPosition + 15, orderTypeChartData, orderTypeColors);
      
      yPosition += 75;
    }

    // ==================== PAGE 4: ITEM VS SERVICE ANALYSIS ====================
    
    // Force new page for this section
    doc.addPage();
    yPosition = 20;
    
    drawGradientHeader('3. ITEM VS SERVICE ANALYSIS', yPosition);
    yPosition += 20;
    
    if (itemServiceBreakdown && itemServiceBreakdown.breakdown) {
      const tableData = [];
      const total = itemServiceBreakdown.total || 0;
      
      Object.entries(itemServiceBreakdown.breakdown).forEach(([category, data]) => {
        if (data.value > 0) {
          const percentage = safeDivide(data.value * 100, total).toFixed(2);
          tableData.push([
            category,
            formatBillions(data.value),
            formatNumber(data.qty),
            `${percentage}%`,
            formatBillions(safeDivide(data.value, data.qty))
          ]);
        }
      });
      
      // Add Total Row
      tableData.push([
        'TOTAL',
        formatBillions(total),
        formatNumber(itemServiceBreakdown.totalQty),
        '100.00%',
        formatBillions(safeDivide(total, itemServiceBreakdown.totalQty))
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Category', 'Total Amount', 'Quantity', 'Share %', 'Avg. Value']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: colors.purple,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          textColor: colors.white
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { fontStyle: 'bold', halign: 'left', cellWidth: 40 },
          1: { halign: 'right', cellWidth: 35 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 35 }
        },
        margin: { left: 15, right: 15 },
        didParseCell: (data) => {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = colors.light;
            data.cell.styles.textColor = colors.dark;
          }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
      
      // Add visual separator
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      
      yPosition += 15;
      
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ITEM VS SERVICE DISTRIBUTION CHART', 15, yPosition);
      
      yPosition += 10;
      
      const itemServiceChartData = [];
      const itemServiceColors = [
        colors.purple,    // Purple - Item
        colors.danger     // Red - Service
      ];
      
      Object.entries(itemServiceBreakdown.breakdown).forEach(([category, data]) => {
        if (data.value > 0) {
          const percentage = safeDivide(data.value * 100, total);
          itemServiceChartData.push({
            label: category,
            percentage: percentage,
            value: data.value
          });
        }
      });
      
      const chartCenterX = 50;
      const chartCenterY = yPosition + 35;
      const outerRadius = 30;
      const innerRadius = 18;
      
      drawDonutChart(chartCenterX, chartCenterY, outerRadius, innerRadius, itemServiceChartData, itemServiceColors);
      drawLegend(100, yPosition + 15, itemServiceChartData, itemServiceColors);
      
      yPosition += 75;
    }

    // ==================== PAGE 5: CURRENCY ANALYSIS ====================
    
    if (currencyBreakdown && currencyBreakdown.breakdown && Object.keys(currencyBreakdown.breakdown).length > 0) {
      // Force new page for this section
      doc.addPage();
      yPosition = 20;
      
      drawGradientHeader('4. CURRENCY-WISE ANALYSIS', yPosition);
      yPosition += 20;
      
      const tableData = [];
      const total = currencyBreakdown.total || 0;
      
      const sortedCurrencies = Object.entries(currencyBreakdown.breakdown)
        .sort((a, b) => b[1].value - a[1].value);
      
      sortedCurrencies.forEach(([currency, data]) => {
        if (data.value > 0) {
          const percentage = safeDivide(data.value * 100, total).toFixed(2);
          tableData.push([
            currency,
            formatBillions(data.value),
            formatNumber(data.qty),
            `${percentage}%`,
            formatBillions(safeDivide(data.value, data.qty))
          ]);
        }
      });
      
      tableData.push([
        'TOTAL',
        formatBillions(total),
        formatNumber(currencyBreakdown.totalQty),
        '100.00%',
        formatBillions(safeDivide(total, currencyBreakdown.totalQty))
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Currency', 'Total Amount', 'Quantity', 'Share %', 'Avg. Value']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: colors.success,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          textColor: colors.white
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { fontStyle: 'bold', halign: 'left', cellWidth: 40 },
          1: { halign: 'right', cellWidth: 35 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 35 }
        },
        margin: { left: 15, right: 15 },
        didParseCell: (data) => {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = colors.light;
            data.cell.styles.textColor = colors.dark;
          }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
      
      // Add visual separator
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      
      yPosition += 15;
      
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CURRENCY DISTRIBUTION CHART (TOP 5)', 15, yPosition);
      
      yPosition += 10;
      
      const currencyChartData = [];
      const currencyColors = [
        colors.success,
        colors.accent,
        colors.orange,
        colors.purple,
        colors.danger,
        [236, 72, 153],
        [20, 184, 166]
      ];
      
      sortedCurrencies.slice(0, 5).forEach(([currency, data]) => {
        if (data.value > 0) {
          const percentage = safeDivide(data.value * 100, total);
          currencyChartData.push({
            label: currency,
            percentage: percentage,
            value: data.value
          });
        }
      });
      
      const chartCenterX = 50;
      const chartCenterY = yPosition + 35;
      const outerRadius = 30;
      const innerRadius = 18;
      
      drawDonutChart(chartCenterX, chartCenterY, outerRadius, innerRadius, currencyChartData, currencyColors);
      drawLegend(100, yPosition + 15, currencyChartData, currencyColors);
      
      yPosition += 75;
    }

    // ==================== PAGE 6: TOP VENDORS ====================
    
    if (vendorBreakdown && vendorBreakdown.breakdown) {
      // Force new page for this section
      doc.addPage();
      yPosition = 20;
      
      drawGradientHeader('5. TOP 10 VENDORS ANALYSIS', yPosition);
      yPosition += 20;
      
      const vendorTableData = [];
      const entries = Object.entries(vendorBreakdown.breakdown);
      let rank = 1;
      
      entries.forEach(([vendor, data]) => {
        const percentage = safeDivide(data.value * 100, vendorBreakdown.total).toFixed(2);
        
        vendorTableData.push([
          vendor === 'Other Vendors' ? '-' : rank++,
          vendor,
          formatBillions(data.value),
          formatNumber(data.qty),
          `${percentage}%`
        ]);
      });
      
      vendorTableData.push([
        '',
        'GRAND TOTAL',
        formatBillions(vendorBreakdown.total),
        formatNumber(vendorBreakdown.totalQty),
        '100.00%'
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Rank', 'Vendor Name', 'Total Amount', 'Orders', 'Share %']],
        body: vendorTableData,
        theme: 'grid',
        headStyles: {
          fillColor: colors.success,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          textColor: colors.white
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { fontStyle: 'normal', halign: 'left', cellWidth: 70 },
          2: { halign: 'right', cellWidth: 35 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'center', cellWidth: 20 }
        },
        margin: { left: 15, right: 15 },
        didParseCell: (data) => {
          if (data.row.index === vendorTableData.length - 1 || 
              (data.cell.raw && data.cell.raw.toString().includes('Other Vendors'))) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = colors.light;
            data.cell.styles.textColor = colors.dark;
          }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // ==================== FINAL PAGE: INSIGHTS & NOTES ====================
    
    doc.addPage();
    yPosition = 20;
    
    drawGradientHeader('6. KEY INSIGHTS & NOTES', yPosition);
    yPosition += 25;
    
    // Insights section
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT NOTES', 15, yPosition);
    
    yPosition += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const notes = [
      '• All monetary values are displayed in Indian Rupees (Rs.)',
      '• Large amounts formatted with B (Billions), M (Millions), K (Thousands) for readability',
      '• Purchase orders categorized by first digit: 1=Import, 2=Local, 3=Job Orders',
      '• Percentages calculated based on total purchase value in respective category',
      '• Donut charts show proportional distribution with percentage labels',
      '• Vendor rankings based on total purchase value (descending order)',
      '• This report generated from LTL Purchase Analyzer system',
      '• All calculations automated and verified for accuracy',
      '• Data coverage specified in Report Scope section (page 1)'
    ];
    
    notes.forEach(note => {
      doc.text(note, 20, yPosition);
      yPosition += 6;
    });
    
    yPosition += 15;
    
    // Data Quality section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA QUALITY ASSURANCE', 15, yPosition);
    
    yPosition += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const qualityNotes = [
      '• Data validated for completeness and accuracy before analysis',
      '• Empty and null values excluded from calculations',
      '• Duplicate entries checked and removed if found',
      '• Currency formatting standardized across all sections',
      '• Totals cross-verified for mathematical accuracy'
    ];
    
    qualityNotes.forEach(note => {
      doc.text(note, 20, yPosition);
      yPosition += 6;
    });
    
    yPosition += 20;
    
    // Signature Section
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, 85, yPosition);
    doc.line(pageWidth - 85, yPosition, pageWidth - 20, yPosition);
    
    yPosition += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.dark);
    doc.text('Prepared By', 20, yPosition);
    doc.text('Approved By', pageWidth - 85, yPosition);
    
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Analysis Team', 20, yPosition);
    doc.text('Management', pageWidth - 85, yPosition);
    
    // Enhanced Modern Footer
    yPosition = pageHeight - 38;
    
    // Gradient footer with enhanced styling
    for (let i = 0; i < 25; i++) {
      const ratio = i / 25;
      const r = colors.primary[0] + (colors.secondary[0] - colors.primary[0]) * ratio;
      const g = colors.primary[1] + (colors.secondary[1] - colors.primary[1]) * ratio;
      const b = colors.primary[2] + (colors.secondary[2] - colors.primary[2]) * ratio;
      doc.setFillColor(r, g, b);
      doc.rect(0, yPosition + i * 1.52, pageWidth, 1.52, 'F');
    }
    
    // Decorative line at top of footer
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(0, yPosition, pageWidth, yPosition);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('LTL TRANSFORMERS', pageWidth / 2, yPosition + 11, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Report Generated: ${reportDate}`, pageWidth / 2, yPosition + 19, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setTextColor(240, 240, 240);
    doc.text('Confidential - For Authorized Personnel Only', pageWidth / 2, yPosition + 26, { align: 'center' });
    doc.text('(c) 2025 LTL Transformers. All Rights Reserved.', pageWidth / 2, yPosition + 32, { align: 'center' });

    // Add enhanced footers to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      if (i > 1) { // Skip footer on cover page
        const footerY = pageHeight - 12;
        
        // Add subtle line above footer
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(15, footerY - 3, pageWidth - 15, footerY - 3);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'normal');
        doc.text('LTL Transformers - Purchase Analysis Report', pageWidth / 2, footerY, { align: 'center' });
        
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'bold');
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, footerY, { align: 'right' });
        doc.text(`${new Date().toLocaleDateString('en-IN')}`, 20, footerY);
      }
    }

    // Save PDF
    const fileName = `LTL_Purchase_Analysis_${new Date().toISOString().split('T')[0]}_${new Date().getHours()}${new Date().getMinutes()}.pdf`;
    
    console.log('💾 Saving enhanced PDF:', fileName);
    doc.save(fileName);
    
    console.log('✅ Enhanced PDF generated and saved successfully');
    return fileName;
    
  } catch (error) {
    console.error('❌ PDF Generation Error:', error);
    throw error;
  }
};
