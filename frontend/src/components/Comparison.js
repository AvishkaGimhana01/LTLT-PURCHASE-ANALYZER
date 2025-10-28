import React, { useState, useMemo } from 'react';


import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';


import { Pie, Bar } from 'react-chartjs-2';


import ChartDataLabels from 'chartjs-plugin-datalabels';


import './Comparison.css';





ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels);





const Comparison = ({ data, filters, setFilters }) => {


  console.log(' Comparison component loaded with data:', {


    hasData: !!data,


    dataLength: data?.length,


    firstRow: data?.[0],


    firstRowKeys: data?.[0] ? Object.keys(data[0]) : [],


    persistedFilters: filters


  });





  // Use persistent filtefrom parent, with local state as fallback


  const [period1Start, setPeriod1Start] = useState(filters?.period1Start || '');


  const [period1End, setPeriod1End] = useState(filters?.period1End || '');


  const [period2Start, setPeriod2Start] = useState(filters?.period2Start || '');


  const [period2End, setPeriod2End] = useState(filters?.period2End || '');


  const [dateColumn, setDateColumn] = useState(filters?.dateColumn || '');





  // Update parent state whenever filters change


  const updateFilters = (updates) => {


    const newFilters = {


      period1Start,


      period1End,


      period2Start,


      period2End,


      dateColumn,


      ...updates


    };


    if (setFilters) {


      setFilters(newFilters);


    }


  };





  // Wrapper functions to update both local and parent state


  const handleSetPeriod1Start = (value) => {


    setPeriod1Start(value);


    updateFilters({ period1Start: value });


  };





  const handleSetPeriod1End = (value) => {


    setPeriod1End(value);


    updateFilters({ period1End: value });


  };





  const handleSetPeriod2Start = (value) => {


    setPeriod2Start(value);


    updateFilters({ period2Start: value });


  };





  const handleSetPeriod2End = (value) => {


    setPeriod2End(value);


    updateFilters({ period2End: value });


  };





  const handleSetDateColumn = (value) => {


    setDateColumn(value);


    updateFilters({ dateColumn: value });


  };





  // Clear filters function


  const handleClearFilters = () => {


    setPeriod1Start('');


    setPeriod1End('');


    setPeriod2Start('');


    setPeriod2End('');


    setDateColumn('');


    if (setFilters) {


      setFilters({


        period1Start: '',


        period1End: '',


        period2Start: '',


        period2End: '',


        dateColumn: ''


      });


    }


  };





  // Format currency


  const formatCurrency = (value) => {


    if (value === null || value === undefined || isNaN(value)) return 'Rs. 0.00';


    return 'Rs. ' + Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');


  };





  // Format billions


  const formatBillions = (value) => {


    if (value === null || value === undefined || isNaN(value)) return 'Rs. 0.00B';


    const billions = (value / 1000000000).toFixed(2);


    return `Rs. ${billions}B`;


  };





  // Auto-detect "Date" column (exclude "Due Date")


  const dateColumns = useMemo(() => {


    if (!data || data.length === 0) return [];


    const cols = Object.keys(data[0]).filter(col => {


      const sampleValue = data[0][col];


      if (!sampleValue) return false;


      const str = String(sampleValue);


      const lower = col.toLowerCase();


      // Exclude "Due Date" column


      if (lower.includes('due') && lower.includes('date')) return false;


      return str.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/) || 


             str.match(/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/) ||


             lower.includes('date');


    });


    return cols;


  }, [data]);


  


  // Auto-select the first date column (typically "Date")


  React.useEffect(() => {


    if (dateColumns.length > 0 && !dateColumn) {


      handleSetDateColumn(dateColumns[0]);


    }


  }, [dateColumns]);





  // Parse date function (supports multiple formats)


  const parseDate = (dateStr) => {


    if (!dateStr) return null;


    const str = String(dateStr).trim();


    


    // Try MM/DD/YYYY or M/D/YYYY


    let match = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);


    if (match) {


      return new Date(match[3], match[1] - 1, match[2]);


    }


    


    // Try DD/MM/YYYY or D/M/YYYY


    match = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);


    if (match) {


      const date1 = new Date(match[3], match[1] - 1, match[2]);


      const date2 = new Date(match[3], match[2] - 1, match[1]);


      return date1.getTime() < date2.getTime() ? date1 : date2;


    }


    


    // Try YYYY-MM-DD


    match = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);


    if (match) {


      return new Date(match[1], match[2] - 1, match[3]);


    }


    


    return null;


  };





  // Filter data for period


  const filterDataByPeriod = (startDate, endDate) => {


    if (!dateColumn || !startDate || !endDate) return [];


    


    const start = new Date(startDate);


    const end = new Date(endDate);


    


    return data.filter(row => {


      const dateValue = row[dateColumn];


      if (!dateValue) return false;


      


      const rowDate = parseDate(dateValue);


      if (!rowDate) return false;


      


      return rowDate >= start && rowDate <= end;


    });


  };





  const period1Data = useMemo(() => {


    const filtered = filterDataByPeriod(period1Start, period1End);


    console.log('Period 1 Data:', { 


      count: filtered.length, 


      dateColumn, 


      period1Start, 


      period1End,


      sample: filtered[0] 


    });


    return filtered;


  }, [period1Start, period1End, dateColumn, data]);


  


  const period2Data = useMemo(() => {


    const filtered = filterDataByPeriod(period2Start, period2End);


    console.log('Period 2 Data:', { 


      count: filtered.length, 


      dateColumn, 


      period2Start, 


      period2End,


      sample: filtered[0] 


    });


    return filtered;


  }, [period2Start, period2End, dateColumn, data]);





  // Detect columns using the same logic as FilteredAnalysis


  const detectedColumns = useMemo(() => {


    if (!data || data.length === 0) return {};


    


    const firstRow = data[0];


    const keys = Object.keys(firstRow);


    


    console.log(' Available column names:', keys);


    


    const detected = {


      // For Amount column - MUST NOT match price mode or currency columns


      amount: keys.find(k => {


        const normalized = k.toLowerCase().replace(/[_\s]/g, '');


        const lower = k.toLowerCase();


        


        // Explicitly exclude price mode and currency columns


        if (lower.includes('price') && lower.includes('mode')) return false;


        if (lower.includes('pricemode')) return false;


        if (normalized === 'currency') return false;


        


        // Now check for amount-related terms


        return normalized.includes('amount') ||


               normalized.includes('documenttotal') ||


               normalized.includes('doctotal') ||


               normalized.includes('total') ||


               normalized.includes('sum') ||


               normalized.includes('net') ||


               normalized.includes('gross') ||


               normalized === 'amt' ||


               normalized.includes('sales') ||


               normalized.includes('revenue') ||


               normalized.includes('value');


      }),


      // For Vendor name


      vendor: keys.find(k => {


        const lower = k.toLowerCase().replace(/\s+/g, '');


        return lower.includes('vendor') || 


               lower.includes('supplier') || 


               lower === 'vendorname' ||


               lower === 'suppliername' ||


               k === 'Vendor Name' ||


               k === 'vendor_name';


      }),


      // For Price Mode / Currency


      priceMode: keys.find(k => {


        const lower = k.toLowerCase();


        const normalized = k.toLowerCase().replace(/[_\s]/g, '');


        console.log(`Checking column "${k}" -> lower: "${lower}" -> normalized: "${normalized}"`);


        return lower.includes('price mode') || 


               lower.includes('pricemode') ||


               lower.includes('price_mode') ||


               normalized.includes('pricemode') ||


               normalized.includes('currency') ||


               k === 'Price Mode' ||


               k === 'price_mode';


      }),


      // For Item/Service column


      itemService: keys.find(k => {


        const lower = k.toLowerCase();


        return (lower.includes('item') && lower.includes('service')) ||


               (lower.includes('document') && lower.includes('type')) ||


               lower === 'type' ||


               k === 'Item / service';


      }),


      // For Item Code column (#_1)


      itemCode: keys.find(k => {


        return k === '#_1' || k === '#_1_1' || 


               k.toLowerCase() === 'item_code' ||


               k.toLowerCase() === 'itemcode' ||


               (k.startsWith('#') && k !== '#');


      })


    };


    


    console.log('📊 Detected columns:', detected);


    console.log(' Price Mode Column:', detected.priceMode);


    return detected;


  }, [data]);





  const amountColumn = detectedColumns.amount;


  const vendorColumn = detectedColumns.vendor;


  const itemServiceColumn = detectedColumns.itemService;


  const priceModeColumn = detectedColumns.priceMode;


  const itemCodeColumn = detectedColumns.itemCode;





  // Analysis function for a dataset


  const analyzeData = (dataset, columns) => {


    const { amount, vendor, itemService: itemServiceCol, priceMode, itemCode } = columns;


    


    console.log(' analyzeData called with:', {


      datasetLength: dataset?.length,


      columns,


      sampleRow: dataset?.[0],


      amountColumnValue: dataset?.[0]?.[amount],


      priceModeColumnValue: dataset?.[0]?.[priceMode]


    });





    if (!dataset || dataset.length === 0) {


      return {


        totalAmount: 0,


        recordCount: 0,


        orderTypes: {},


        itemService: {},


        currencies: {},


        topVendors: []


      };


    }





    let totalAmount = 0;


    const orderTypes = { 'Import Orders': 0, 'Local Orders': 0, 'Job Orders': 0 };


    const itemService = { 'Item': 0, 'Service': 0 };


    const currencies = {};


    const vendorTotals = {};





    // Debug first 3 rows to see actual data


    console.log(' Inspecting first 3 rows of data:');


    dataset.slice(0, 3).forEach((row, i) => {


      console.log(`  Row ${i + 1}:`, {


        amountColumn: amount,


        amountValue: row[amount],


        amountType: typeof row[amount],


        priceModeColumn: priceMode,


        priceModeValue: row[priceMode],


        allKeys: Object.keys(row).slice(0, 10)


      });


    });





    dataset.forEach((row, index) => {


      // Amount - Robust parsing like FilteredAnalysis


      let amountValue = 0;


      if (amount && row[amount] !== null && row[amount] !== undefined && row[amount] !== '') {


        const amountRaw = row[amount];


        if (typeof amountRaw === 'number') {


          amountValue = amountRaw;


        } else if (typeof amountRaw === 'string') {


          // Remove currency symbols, commas, spaces


          const cleaned = amountRaw.replace(/[?$ℹ¿½ℹ¿½,\s]/g, '').trim();


          amountValue = parseFloat(cleaned) || 0;


        } else {


          amountValue = parseFloat(amountRaw) || 0;


        }


        totalAmount += amountValue;


      }





      // Order types


      if (itemCode && row[itemCode]) {


        const code = String(row[itemCode]);


        const firstDigit = code.charAt(0);


        if (firstDigit === '1') orderTypes['Import Orders']++;


        else if (firstDigit === '2') orderTypes['Local Orders']++;


        else if (firstDigit === '3') orderTypes['Job Orders']++;


      }





      // Item/Service


      if (itemServiceCol && row[itemServiceCol]) {


        const type = String(row[itemServiceCol]).trim();


        if (type === 'Item') itemService['Item']++;


        else if (type === 'Service') itemService['Service']++;


      }





      // Currencies


      if (priceMode && row[priceMode]) {


        const currency = String(row[priceMode]).trim();


        if (!currencies[currency]) {


          currencies[currency] = 0;


          // Log first occurrence of each currency


          if (Object.keys(currencies).length <= 3) {


            console.log(` Found currency: "${currency}" | Amount column: "${amount}" | Amount raw: ${row[amount]}`);


          }


        }


        if (amountValue > 0) {


          currencies[currency] += amountValue;


          // Log first few additions


          if (Object.keys(currencies).length <= 3 && index < 5) {


            console.log(`📊 Added ${amountValue} to ${currency}, new total: ${currencies[currency]}`);


          }


        } else if (index < 3) {


          console.warn(`   Zero amount for currency ${currency} at row ${index}: raw="${row[amount]}"`);


        }


      }





      // Vendors


      if (vendor && row[vendor] && amountValue > 0) {


        const vendorName = String(row[vendor]).trim();


        if (!vendorTotals[vendorName]) vendorTotals[vendorName] = 0;


        vendorTotals[vendorName] += amountValue;


      }


    });





    // Top 10 vendors


    const topVendors = Object.entries(vendorTotals)


      .sort((a, b) => b[1] - a[1])


      .slice(0, 10);





    const result = {


      totalAmount,


      recordCount: dataset.length,


      orderTypes,


      itemService,


      currencies,


      topVendors


    };


    


    console.log(' analyzeData result:', {


      totalAmount,


      recordCount: dataset.length,


      currencyCount: Object.keys(currencies).length,


      currencies: currencies,


      sampleCurrencies: Object.entries(currencies).slice(0, 3)


    });


    


    return result;


  };





  const analysis1 = useMemo(() => {


    return analyzeData(period1Data, {


      amount: amountColumn,


      vendor: vendorColumn,


      itemService: itemServiceColumn,


      priceMode: priceModeColumn,


      itemCode: itemCodeColumn


    });


  }, [period1Data, amountColumn, itemCodeColumn, itemServiceColumn, priceModeColumn, vendorColumn]);


  


  const analysis2 = useMemo(() => {


    return analyzeData(period2Data, {


      amount: amountColumn,


      vendor: vendorColumn,


      itemService: itemServiceColumn,


      priceMode: priceModeColumn,


      itemCode: itemCodeColumn


    });


  }, [period2Data, amountColumn, itemCodeColumn, itemServiceColumn, priceModeColumn, vendorColumn]);





  // Calculate order type breakdown by items/services for both periods
  const orderTypeBreakdown = useMemo(() => {
    const calculateBreakdown = (dataset) => {
      const breakdown = {
        'Import Order': { item: 0, service: 0 },
        'Local Order': { item: 0, service: 0 },
        'Job Order': { item: 0, service: 0 }
      };

      if (!dataset || dataset.length === 0 || !itemCodeColumn || !itemServiceColumn || !amountColumn) {
        return breakdown;
      }

      dataset.forEach((row) => {
        const orderNumber = String(row[itemCodeColumn] || '').trim();
        const category = String(row[itemServiceColumn] || '').trim();
        const amountRaw = row[amountColumn];
        
        // Parse amount
        let amount = 0;
        if (amountRaw === null || amountRaw === undefined || amountRaw === '') {
          amount = 0;
        } else if (typeof amountRaw === 'number') {
          amount = amountRaw;
        } else if (typeof amountRaw === 'string') {
          const cleaned = amountRaw.replace(/[?$ℹ¿½ℹ¿½,\s]/g, '').trim();
          amount = parseFloat(cleaned) || 0;
        } else {
          amount = parseFloat(amountRaw) || 0;
        }

        if (!orderNumber || amount === 0) return;

        // Determine order type from first digit
        const firstChar = orderNumber.charAt(0);
        let orderType = '';
        
        if (firstChar === '1') {
          orderType = 'Import Order';
        } else if (firstChar === '2') {
          orderType = 'Local Order';
        } else if (firstChar === '3') {
          orderType = 'Job Order';
        } else {
          return; // Skip if not 1, 2, or 3
        }

        // Categorize as item or service
        if (category === 'Item') {
          breakdown[orderType].item += amount;
        } else if (category === 'Service') {
          breakdown[orderType].service += amount;
        }
      });

      return breakdown;
    };

    const period1Breakdown = calculateBreakdown(period1Data);
    const period2Breakdown = calculateBreakdown(period2Data);

    return {
      period1: period1Breakdown,
      period2: period2Breakdown,
      categories: ['Import Order', 'Local Order', 'Job Order']
    };
  }, [period1Data, period2Data, itemCodeColumn, itemServiceColumn, amountColumn]);

  // Donut Chart options with professional dashboard animations


  const pieChartOptions = {


    responsive: true,


    maintainAspectRatio: true,


    cutout: '68%', // Premium donut hole (68% for modern dashboard look)


    radius: '92%', // Chart radius


    rotation: -90, // Start from top (12 o'clock position)


    animation: {


      animateRotate: true,


      animateScale: true,


      duration: 1200, // 1.2s smooth professional animation


      easing: 'easeInOutQuad',


      delay: (context) => {


        // Simple sequential reveal - clean and professional


        return context.dataIndex * 100;


      }


    },


    interaction: {


      mode: 'point',


      intersect: true


    },


    hover: {


      mode: 'nearest',


      animationDuration: 300


    },


    plugins: {


      legend: {


        position: 'bottom',


        labels: { 


          font: { size: 13, weight: '600', family: "'Inter', sans-serif" },


          padding: 20,


          usePointStyle: true,


          pointStyle: 'circle',


          color: '#374151',


          boxWidth: 14,


          boxHeight: 14,


          generateLabels: (chart) => {


            const data = chart.data;


            if (data.labels.length && data.datasets.length) {


              return data.labels.map((label, i) => {


                const value = data.datasets[0].data[i];


                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);


                const percentage = ((value / total) * 100).toFixed(1);


                return {


                  text: `${label} (${percentage}%)`,


                  fillStyle: data.datasets[0].backgroundColor[i],


                  hidden: false,


                  index: i


                };


              });


            }


            return [];


          }


        },


        onHover: (event, legendItem, legend) => {


          event.native.target.style.cursor = 'pointer';


        }


      },


      tooltip: {


        enabled: true,


        backgroundColor: 'rgba(255, 255, 255, 0.98)',


        titleColor: '#1f2937',


        bodyColor: '#374151',


        borderColor: '#667eea',


        borderWidth: 2,


        padding: 18,


        titleFont: { size: 15, weight: 'bold' },


        bodyFont: { size: 14 },


        cornerRadius: 12,


        displayColors: true,


        boxPadding: 8,


        usePointStyle: true,


        callbacks: {


          label: (context) => {


            const value = context.parsed || 0;


            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);


            const percentage = ((value / total) * 100).toFixed(1);


            const billions = (value / 1000000000).toFixed(2);


            return ` Rs. ${billions}B (${percentage}%)`;


          }


        }


      },


      datalabels: {


        color: '#ffffff',


        font: { size: 16, weight: 'bold', family: "'Inter', sans-serif" },


        textStrokeColor: 'rgba(0, 0, 0, 0.4)',


        textStrokeWidth: 3,


        textShadowColor: 'rgba(0, 0, 0, 0.6)',


        textShadowBlur: 6,


        offset: 5,


        formatter: (value, ctx) => {


          const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);


          const percentage = ((value / total) * 100).toFixed(1);


          return percentage > 5 ? percentage + '%' : '';


        }


      }


    }


  };





  const barChartOptions = {


    responsive: true,


    maintainAspectRatio: false,


    indexAxis: 'y', // Horizontal bar chart


    animation: {


      duration: 1800, // Smooth 1.8s animation


      easing: 'easeOutQuart', // Professional deceleration


      delay: (context) => {


        // Stagger each bar with progressive delay


        return context.dataIndex * 150;


      },


      x: {


        duration: 1800,


        from: 0,


        easing: 'easeOutElastic'


      },


      onProgress: function(animation) {


        // Smooth reveal effect with scale


        const progress = animation.currentStep / animation.numSteps;


        if (progress < 1) {


          this.canvas.style.opacity = Math.min(1, progress * 1.3);


        }


      },


      onComplete: function() {


        this.canvas.style.opacity = 1;


      }


    },


    interaction: {


      mode: 'index',


      intersect: false


    },


    hover: {


      mode: 'nearest',


      animationDuration: 400


    },


    layout: {


      padding: {


        right: 110, // Extra padding for labels


        left: 10,


        top: 10,


        bottom: 10


      }


    },


    plugins: {


      legend: { 


        display: false 


      },


      tooltip: {


        enabled: true,


        backgroundColor: 'rgba(255, 255, 255, 0.98)',


        titleColor: '#1f2937',


        bodyColor: '#374151',


        borderColor: '#667eea',


        borderWidth: 2,


        padding: 20,


        titleFont: { size: 15, weight: 'bold', family: "'Inter', sans-serif" },


        bodyFont: { size: 14, family: "'Inter', sans-serif" },


        cornerRadius: 12,


        displayColors: true,


        boxPadding: 8,


        callbacks: {


          label: (context) => {


            const value = context.parsed.x || 0;


            const billions = (value / 1000000000).toFixed(2);


            const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);


            const percentage = ((value / total) * 100).toFixed(2);


            return ` Amount: Rs. ${billions}B (${percentage}%)`;


          }


        }


      },


      datalabels: {


        anchor: 'end',


        align: 'end',


        offset: 8,


        clamp: false, // Allow labels to extend beyond chart area


        clip: false,  // Don't clip labels


        color: (context) => {


          // Dynamic color based on bar


          const hue = 250 + (context.dataIndex * 15);


          return `hsl(${hue}, 80%, 50%)`;


        },


        font: { 


          size: 13, 


          weight: 'bold',


          family: "'Inter', sans-serif"


        },


        backgroundColor: (context) => {


          const hue = 250 + (context.dataIndex * 15);


          return `hsla(${hue}, 70%, 95%, 0.9)`;


        },


        borderRadius: 6,


        padding: {


          top: 4,


          bottom: 4,


          left: 8,


          right: 8


        },


        formatter: (value, ctx) => {


          const total = ctx.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);


          const percentage = ((value / total) * 100).toFixed(2);


          const billions = (value / 1000000000).toFixed(2);


          return `Rs. ${billions}B (${percentage}%)`;


        }


      }


    },


    scales: {


      x: {


        beginAtZero: true,


        grid: {


          color: 'rgba(102, 126, 234, 0.08)',


          drawBorder: false,


          lineWidth: 1


        },


        border: {


          display: false


        },


        ticks: {


          callback: (value) => {


            const billions = (value / 1000000000).toFixed(1);


            return `Rs. ${billions}B`;


          },


          font: {


            size: 13,


            weight: '600',


            family: "'Inter', sans-serif"


          },


          color: '#6b7280',


          padding: 8


        }


      },


      y: {


        grid: {


          display: false


        },


        border: {


          display: false


        },


        ticks: {


          font: {


            size: 14,


            weight: '700',


            family: "'Inter', sans-serif"


          },


          color: '#374151',


          crossAlign: 'far',


          padding: 12


        }


      }


    }


  };





  // Chart data generators


  const getOrderTypeChartData = (analysis) => {


    if (!analysis || !analysis.orderTypes) {


      console.warn(' No order types data');


      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };


    }


    const values = Object.values(analysis.orderTypes);


    console.log(' Order Type Chart Data:', values);


    return {


      labels: ['Import Orders', 'Local Orders', 'Job Orders'],


      datasets: [{


        data: values,


        backgroundColor: ['#667eea', '#f6ad55', '#9f7aea']


      }]


    };


  };





  const getItemServiceChartData = (analysis) => {


    if (!analysis || !analysis.itemService) {


      console.warn(' No item/service data');


      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };


    }


    const values = Object.values(analysis.itemService);


    console.log(' Item/Service Chart Data:', values);


    return {


      labels: ['Item', 'Service'],


      datasets: [{


        data: values,


        backgroundColor: ['#9f7aea', '#fc8181']


      }]


    };


  };





  const getCurrencyChartData = (analysis) => {


    if (!analysis || !analysis.currencies) {


      console.warn(' No currency data - analysis or currencies missing');


      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };


    }


    


    const entries = Object.entries(analysis.currencies)


      .filter(([key, value]) => value > 0) // Filter out zero values


      .sort((a, b) => b[1] - a[1]);


    


    console.log(' Currency Chart Data:', {


      totalCurrencies: Object.keys(analysis.currencies).length,


      nonZeroCurrencies: entries.length,


      entries: entries.slice(0, 5),


      allCurrencies: analysis.currencies


    });


    


    if (entries.length === 0) {


      console.warn(' All currency values are zero!');


      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };


    }


    


    return {


      labels: entries.map(e => e[0]),


      datasets: [{


        data: entries.map(e => e[1]),


        backgroundColor: ['#48bb78', '#4299e1', '#ed8936', '#9f7aea', '#f56565', '#ed64a6', '#38b2ac', '#dd6b20']


      }]


    };


  };





  const getVendorChartData = (analysis) => {


    if (!analysis || !analysis.topVendors || analysis.topVendors.length === 0) {


      console.warn(' No vendor data');


      return { labels: [], datasets: [{ label: 'Amount', data: [], backgroundColor: [] }] };


    }


    console.log(' Vendor Chart Data:', analysis.topVendors);


    


    // Create gradient colors for bars


    const gradientColors = analysis.topVendors.map((_, i) => {


      const hue = 250 + (i * 15);


      return {


        solid: `hsl(${hue}, 70%, 60%)`,


        gradient: `linear-gradient(90deg, hsl(${hue}, 70%, 55%), hsl(${hue}, 75%, 65%))`


      };


    });


    


    return {


      labels: analysis.topVendors.map(v => v[0]),


      datasets: [{


        label: 'Amount',


        data: analysis.topVendors.map(v => v[1]),


        backgroundColor: gradientColors.map(c => c.solid),


        borderRadius: 8,


        borderSkipped: false,


        hoverBackgroundColor: gradientColors.map((c, i) => {


          const hue = 250 + (i * 15);


          return `hsl(${hue}, 80%, 65%)`;


        }),


        hoverBorderColor: gradientColors.map((c, i) => {


          const hue = 250 + (i * 15);


          return `hsl(${hue}, 80%, 50%)`;


        }),


        hoverBorderWidth: 2


      }]


    };


  };





  const hasValidData = period1Data.length > 0 && period2Data.length > 0;





  return (


    <div className="comparison-container">


      <div className="comparison-header">


        <h2> Period Comparison Analysis</h2>


        <p>Compare purchase data between two different date ranges</p>


      </div>





      {/* Date Range Selector */}


      <div className="comparison-controls">


        {/* Date column auto-selected - no dropdown needed */}


        {(period1Start || period1End || period2Start || period2End) && (


          <div className="date-column-selector">


            <button 


              className="clear-filters-btn"


              onClick={handleClearFilters}


              title="Clear all filters"


            >


              ❌ Clear Filters


            </button>


          </div>


        )}





        <div className="period-selectors">


          <div className="period-selector period-1">


            <h3> Period 1</h3>


            <div className="date-inputs">


              <div className="input-group">


                <label>Start Date:</label>


                <input 


                  type="date" 


                  value={period1Start} 


                  onChange={(e) => handleSetPeriod1Start(e.target.value)}


                />


              </div>


              <div className="input-group">


                <label>End Date:</label>


                <input 


                  type="date" 


                  value={period1End} 


                  onChange={(e) => handleSetPeriod1End(e.target.value)}


                />


              </div>


            </div>


            <div className="period-info">


              {period1Data.length > 0 && (


                <span className="record-badge">{period1Data.length.toLocaleString()} records</span>


              )}


            </div>


          </div>





          <div className="period-selector period-2">


            <h3> Period 2</h3>


            <div className="date-inputs">


              <div className="input-group">


                <label>Start Date:</label>


                <input 


                  type="date" 


                  value={period2Start} 


                  onChange={(e) => handleSetPeriod2Start(e.target.value)}


                />


              </div>


              <div className="input-group">


                <label>End Date:</label>


                <input 


                  type="date" 


                  value={period2End} 


                  onChange={(e) => handleSetPeriod2End(e.target.value)}


                />


              </div>


            </div>


            <div className="period-info">


              {period2Data.length > 0 && (


                <span className="record-badge">{period2Data.length.toLocaleString()} records</span>


              )}


            </div>


          </div>


        </div>


      </div>





      {/* Comparison Results */}


      {hasValidData ? (


        <div className="comparison-results">


          {/* Summary Cards */}


          <div className="summary-comparison">


            <h3> Summary Overview</h3>


            <div className="summary-grid">


              <div className="summary-column period-1-col">


                <div className="summary-card">


                  <div className="summary-label">Total Amount</div>


                  <div className="summary-value">{formatBillions(analysis1.totalAmount)}</div>


                </div>


                <div className="summary-card">


                  <div className="summary-label">Records</div>


                  <div className="summary-value">{analysis1.recordCount.toLocaleString()}</div>


                </div>


              </div>


              <div className="summary-column period-2-col">


                <div className="summary-card">


                  <div className="summary-label">Total Amount</div>


                  <div className="summary-value">{formatBillions(analysis2.totalAmount)}</div>


                </div>


                <div className="summary-card">


                  <div className="summary-label">Records</div>


                  <div className="summary-value">{analysis2.recordCount.toLocaleString()}</div>


                </div>


              </div>


              <div className="summary-column diff-col">


                <div className="summary-card diff-card">


                  <div className="summary-label">Difference</div>


                  <div className={`summary-value ${analysis2.totalAmount > analysis1.totalAmount ? 'positive' : 'negative'}`}>


                    {formatBillions(Math.abs(analysis2.totalAmount - analysis1.totalAmount))}


                    <span className="diff-icon">


                      {analysis2.totalAmount > analysis1.totalAmount ? '📈' : '📉'}


                    </span>


                  </div>


                </div>


                <div className="summary-card diff-card">


                  <div className="summary-label">Difference</div>


                  <div className={`summary-value ${analysis2.recordCount > analysis1.recordCount ? 'positive' : 'negative'}`}>


                    {(analysis2.recordCount - analysis1.recordCount).toLocaleString()}


                    <span className="diff-icon">


                      {analysis2.recordCount > analysis1.recordCount ? '📈' : '📉'}


                    </span>


                  </div>


                </div>


              </div>


            </div>


          </div>





          {/* Order Type & Item/Service Breakdown - CHART REMOVED */}


          {/*REMOVED CHART - <div className="comparison-chart-overview">


            <h3> Visual Comparison: Period 1 vs Period 2</h3>


            <div className="chart-container" style={{ height: '450px', padding: '20px' }}>


              <Bar


                data={{


                  labels: ['Total Amount', 'Import Order', 'Local Order', 'Job Order', 'Items', 'Services'],


                  datasets: [


                    {


                      label: 'Period 1',


                      data: [


                        analysis1.totalAmount,


                        analysis1.orderTypes['Import Orders'] || 0,


                        analysis1.orderTypes['Local Orders'] || 0,


                        analysis1.orderTypes['Job Orders'] || 0,


                        analysis1.itemService['Item'] || 0,


                        analysis1.itemService['Service'] || 0


                      ],


                      backgroundColor: '#3B82F6',


                      borderColor: '#2563EB',


                      borderWidth: 2,


                    },


                    {


                      label: 'Period 2',


                      data: [


                        analysis2.totalAmount,


                        analysis2.orderTypes['Import Orders'] || 0,


                        analysis2.orderTypes['Local Orders'] || 0,


                        analysis2.orderTypes['Job Orders'] || 0,


                        analysis2.itemService['Item'] || 0,


                        analysis2.itemService['Service'] || 0


                      ],


                      backgroundColor: '#F59E0B',


                      borderColor: '#D97706',


                      borderWidth: 2,


                    }


                  ]


                }}


                options={{


                  responsive: true,


                  maintainAspectRatio: false,


                  plugins: {


                    legend: {


                      display: true,


                      position: 'top',


                      labels: {


                        font: {


                          size: 14,


                          family: "'Inter', sans-serif",


                          weight: '600'


                        },


                        padding: 15,


                        boxWidth: 20,


                        boxHeight: 20,


                        usePointStyle: true


                      }


                    },


                    tooltip: {


                      backgroundColor: 'rgba(255, 255, 255, 0.98)',


                      titleColor: '#1f2937',


                      bodyColor: '#374151',


                      borderColor: '#e5e7eb',


                      borderWidth: 2,


                      padding: 16,


                      titleFont: { size: 16, weight: 'bold' },


                      bodyFont: { size: 14 },


                      callbacks: {


                        label: (context) => {


                          const label = context.dataset.label || '';


                          const value = context.parsed.y || 0;


                          return `${label}: ${formatBillions(value)}`;


                        }


                      }


                    },


                    datalabels: {


                      display: false


                    }


                  },


                  scales: {


                    x: {


                      grid: {


                        display: false


                      },


                      ticks: {


                        font: {


                          size: 13,


                          weight: '600'


                        }


                      }


                    },


                    y: {


                      beginAtZero: true,


                      grid: {


                        color: 'rgba(0, 0, 0, 0.05)'


                      },


                      ticks: {


                        font: {


                          size: 12


                        },


                        callback: function(value) {


                          if (value === 0) return 'Rs. 0';


                          const absValue = Math.abs(value);


                          if (absValue >= 1000000000) {


                            return 'Rs. ' + (value / 1000000000).toFixed(1) + 'B';


                          } else if (absValue >= 1000000) {


                            return 'Rs. ' + (value / 1000000).toFixed(1) + 'M';


                          } else if (absValue >= 1000) {


                            return 'Rs. ' + (value / 1000).toFixed(1) + 'K';


                          } else {


                            return 'Rs. ' + value.toFixed(0);


                          }


                        }


                      }


                    }


                  }


                }}


              />


            </div>


          </div>





          END REMOVED CHART */}

          {/* Order Type & Item/Service Breakdown - Visual Comparison Chart Removed Above */}
          {itemCodeColumn && itemServiceColumn && (
            <div className="analysis-comparison" style={{ 
              marginBottom: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              <h3 style={{ 
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '25px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}> Order Type Comparison: Period 1 vs Period 2</h3>
              <div className="chart-container" style={{ 
                height: '550px', 
                padding: '25px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <Bar
                  data={{
                    labels: ['P1 - Import Order', 'P2 - Import Order', 'P1 - Local Order', 'P2 - Local Order', 'P1 - Job Order', 'P2 - Job Order'],
                    datasets: [
                      {
                        label: 'Items',
                        data: [
                          orderTypeBreakdown.period1['Import Order'].item,
                          orderTypeBreakdown.period2['Import Order'].item,
                          orderTypeBreakdown.period1['Local Order'].item,
                          orderTypeBreakdown.period2['Local Order'].item,
                          orderTypeBreakdown.period1['Job Order'].item,
                          orderTypeBreakdown.period2['Job Order'].item
                        ],
                        backgroundColor: (context) => {
                          const index = context.dataIndex;
                          // Period 1: Gradient Blue, Period 2: Gradient Orange
                          return index % 2 === 0 ? '#4F46E5' : '#F97316';
                        },
                        borderColor: (context) => {
                          const index = context.dataIndex;
                          return index % 2 === 0 ? '#4338CA' : '#EA580C';
                        },
                        borderWidth: 0,
                        borderRadius: 8,
                      },
                      {
                        label: 'Services',
                        data: [
                          orderTypeBreakdown.period1['Import Order'].service,
                          orderTypeBreakdown.period2['Import Order'].service,
                          orderTypeBreakdown.period1['Local Order'].service,
                          orderTypeBreakdown.period2['Local Order'].service,
                          orderTypeBreakdown.period1['Job Order'].service,
                          orderTypeBreakdown.period2['Job Order'].service
                        ],
                        backgroundColor: (context) => {
                          const index = context.dataIndex;
                          // Period 1: Light Blue, Period 2: Light Orange
                          return index % 2 === 0 ? '#818CF8' : '#FDBA74';
                        },
                        borderColor: (context) => {
                          const index = context.dataIndex;
                          return index % 2 === 0 ? '#6366F1' : '#FB923C';
                        },
                        borderWidth: 0,
                        borderRadius: 8,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'x',
                    layout: {
                      padding: {
                        top: 25,
                        bottom: 10
                      }
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                        align: 'center',
                        labels: {
                          font: {
                            size: 15,
                            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            weight: '600'
                          },
                          padding: 20,
                          boxWidth: 18,
                          boxHeight: 18,
                          usePointStyle: true,
                          pointStyle: 'rectRounded',
                          color: '#1f2937',
                          filter: function(item, chart) {
                            // Only show Items and Services in legend
                            return item.text === 'Items' || item.text === 'Services';
                          }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.96)',
                        titleColor: '#ffffff',
                        bodyColor: '#e5e7eb',
                        borderColor: '#4F46E5',
                        borderWidth: 2,
                        padding: 16,
                        titleFont: { size: 15, weight: 'bold', family: "'Inter', sans-serif" },
                        bodyFont: { size: 13, family: "'Inter', sans-serif" },
                        bodySpacing: 6,
                        cornerRadius: 8,
                        displayColors: true,
                        boxWidth: 12,
                        boxHeight: 12,
                        boxPadding: 6,
                        callbacks: {
                          title: (context) => {
                            return context[0].label;
                          },
                          label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            if (value === 0) return null;
                            
                            return `${label}: ${formatBillions(value)}`;
                          },
                          afterBody: (context) => {
                            const dataIndex = context[0].dataIndex;
                            const datasets = context[0].chart.data.datasets;
                            const items = datasets[0].data[dataIndex];
                            const services = datasets[1].data[dataIndex];
                            const total = items + services;
                            
                            if (total === 0) return '';
                            
                            const itemsPercent = ((items / total) * 100).toFixed(1);
                            const servicesPercent = ((services / total) * 100).toFixed(1);
                            
                            return [
                              '📊📦🔧',
                              `💰`,
                              `Total: ${formatBillions(total)}`,
                              `Items: ${itemsPercent}%`,
                              `Services: ${servicesPercent}%`
                            ];
                          }
                        }
                      },
                      datalabels: {
                        color: '#ffffff',
                        font: {
                          weight: '700',
                          size: 14,
                          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                        },
                        formatter: (value, context) => {
                          if (value === 0 || value === null || value === undefined) return '';
                          
                          const dataIndex = context.dataIndex;
                          const datasets = context.chart.data.datasets;
                          const items = datasets[0].data[dataIndex];
                          const services = datasets[1].data[dataIndex];
                          const total = items + services;
                          
                          if (total === 0) return '';
                          
                          const percentage = ((value / total) * 100).toFixed(1);
                          
                          // Only show percentage if segment is large enough (at least 3%)
                          if (parseFloat(percentage) < 3) return '';
                          
                          return percentage + '%';
                        },
                        anchor: 'center',
                        align: 'center',
                        textStrokeColor: 'rgba(0, 0, 0, 0.3)',
                        textStrokeWidth: 2,
                        textShadowColor: 'rgba(0, 0, 0, 0.5)',
                        textShadowBlur: 4
                      }
                    },
                    scales: {
                      x: {
                        stacked: true,
                        grid: {
                          display: false,
                          drawBorder: false
                        },
                        ticks: {
                          font: {
                            size: 13,
                            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                            weight: '600'
                          },
                          color: '#374151',
                          padding: 8
                        },
                        border: {
                          display: false
                        }
                      },
                      y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(156, 163, 175, 0.15)',
                          drawBorder: false,
                          lineWidth: 1
                        },
                        ticks: {
                          font: {
                            size: 12,
                            family: "'Inter', sans-serif",
                            weight: '500'
                          },
                          color: '#6b7280',
                          callback: function(value) {
                            return formatBillions(value);
                          },
                          padding: 12,
                          maxTicksLimit: 8
                        },
                        border: {
                          display: false
                        }
                      }
                    },
                    barPercentage: 0.75,
                    categoryPercentage: 0.85
                  }}
                />
              </div>
            </div>
          )}

          {/* Order Type Comparison */}
          {itemCodeColumn && (
            <div className="analysis-comparison" style={{ 
              marginBottom: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              <h3 style={{ 
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '25px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}> Order Type Analysis</h3>
              <div className="comparison-charts" style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <div className="chart-column period-1-col">


                  <h4>Period 1</h4>


                  <div className="chart-wrapper">


                    <Pie data={getOrderTypeChartData(analysis1)} options={pieChartOptions} />


                  </div>


                  <div className="data-table-small">


                    {Object.entries(analysis1.orderTypes).map(([key, value]) => (


                      <div key={key} className="data-row">


                        <span className="label">{key}</span>


                        <span className="value">{value.toLocaleString()}</span>


                      </div>


                    ))}


                  </div>


                </div>


                <div className="chart-column period-2-col">


                  <h4>Period 2</h4>


                  <div className="chart-wrapper">


                    <Pie data={getOrderTypeChartData(analysis2)} options={pieChartOptions} />


                  </div>


                  <div className="data-table-small">


                    {Object.entries(analysis2.orderTypes).map(([key, value]) => (


                      <div key={key} className="data-row">


                        <span className="label">{key}</span>


                        <span className="value">{value.toLocaleString()}</span>


                      </div>


                    ))}


                  </div>


                </div>


              </div>


            </div>


          )}





          {/* Item/Service Comparison */}
          {itemServiceColumn && (
            <div className="analysis-comparison" style={{ 
              marginBottom: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              <h3 style={{ 
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '25px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}> Item vs Service Analysis</h3>
              <div className="comparison-charts" style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <div className="chart-column period-1-col">


                  <h4>Period 1</h4>


                  <div className="chart-wrapper">


                    <Pie data={getItemServiceChartData(analysis1)} options={pieChartOptions} />


                  </div>


                  <div className="data-table-small">


                    {Object.entries(analysis1.itemService).map(([key, value]) => (


                      <div key={key} className="data-row">


                        <span className="label">{key}</span>


                        <span className="value">{value.toLocaleString()}</span>


                      </div>


                    ))}


                  </div>


                </div>


                <div className="chart-column period-2-col">


                  <h4>Period 2</h4>


                  <div className="chart-wrapper">


                    <Pie data={getItemServiceChartData(analysis2)} options={pieChartOptions} />


                  </div>


                  <div className="data-table-small">


                    {Object.entries(analysis2.itemService).map(([key, value]) => (


                      <div key={key} className="data-row">


                        <span className="label">{key}</span>


                        <span className="value">{value.toLocaleString()}</span>


                      </div>


                    ))}


                  </div>


                </div>


              </div>


            </div>


          )}





          {/* Currency Comparison */}


          {(() => {


            const shouldShow = priceModeColumn && Object.keys(analysis1.currencies).length > 0;


            console.log(' Currency Chart Visibility Check:', {


              priceModeColumn,


              hasCurrencies: Object.keys(analysis1.currencies).length > 0,


              currencyKeys: Object.keys(analysis1.currencies),


              shouldShow


            });


            return shouldShow;
          })() && (
            <div className="analysis-comparison" style={{ 
              marginBottom: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              <h3 style={{ 
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '25px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}> Currency Analysis</h3>
              <div className="comparison-charts" style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <div className="chart-column period-1-col">


                  <h4>Period 1</h4>


                  <div className="chart-wrapper">


                    <Pie data={getCurrencyChartData(analysis1)} options={pieChartOptions} />


                  </div>


                  <div className="data-table-small">


                    {Object.entries(analysis1.currencies).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([key, value]) => (


                      <div key={key} className="data-row">


                        <span className="label">{key}</span>


                        <span className="value">{formatBillions(value)}</span>


                      </div>


                    ))}


                  </div>


                </div>


                <div className="chart-column period-2-col">


                  <h4>Period 2</h4>


                  <div className="chart-wrapper">


                    <Pie data={getCurrencyChartData(analysis2)} options={pieChartOptions} />


                  </div>


                  <div className="data-table-small">


                    {Object.entries(analysis2.currencies).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([key, value]) => (


                      <div key={key} className="data-row">


                        <span className="label">{key}</span>


                        <span className="value">{formatBillions(value)}</span>


                      </div>


                    ))}


                  </div>


                </div>


              </div>


            </div>


          )}





          {/* Top VendoComparison */}
          {vendorColumn && analysis1.topVendors.length > 0 && (
            <div className="analysis-comparison" style={{ 
              marginBottom: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              <h3 style={{ 
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '25px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}> Top 10 Vendors</h3>
              <div className="comparison-charts" style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <div className="chart-column period-1-col">


                  <h4>Period 1</h4>


                  <div className="chart-wrapper-bar">


                    <Bar data={getVendorChartData(analysis1)} options={barChartOptions} />


                  </div>


                </div>


                <div className="chart-column period-2-col">


                  <h4>Period 2</h4>


                  <div className="chart-wrapper-bar">


                    <Bar data={getVendorChartData(analysis2)} options={barChartOptions} />


                  </div>


                </div>


              </div>


            </div>


          )}


        </div>


      ) : (


        <div className="no-comparison-data">


          <div className="empty-state">


            <span className="empty-icon"></span>


            <h3>Select Date Ranges to Compare</h3>


            <p>Choose a date column and set date ranges for both periods to see the comparison analysis</p>


          </div>


        </div>


      )}


    </div>


  );


};





export default Comparison;













