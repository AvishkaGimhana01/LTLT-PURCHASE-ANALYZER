import React, { useState, useMemo } from 'react';


import './DataTable.css';





const DataTable = ({ data, columns, totalRecords, onShowAnalysis, tableFilters, setTableFilters }) => {


  // Filter out the '#' column since we already have a row number column


  const displayColumns = useMemo(() => {


    return columns.filter(col => col !== '#');


  }, [columns]);



  // Use props for state if provided, otherwise use local state (backwards compatibility)


  const useExternalState = tableFilters && setTableFilters;


  


  // Local state (only used if no external state provided)


  const [localCurrentPage, setLocalCurrentPage] = useState(1);


  const [localItemsPerPage, setLocalItemsPerPage] = useState(50);


  const [localSearchTerm, setLocalSearchTerm] = useState('');


  const [localSortConfig, setLocalSortConfig] = useState({ key: null, direction: 'asc' });


  const [localFilters, setLocalFilters] = useState({});


  const [localShowDateFilter, setLocalShowDateFilter] = useState(false);


  const [localDateFilterMode, setLocalDateFilterMode] = useState('exact');


  const [localSelectedDate, setLocalSelectedDate] = useState('');


  const [localStartDate, setLocalStartDate] = useState('');


  const [localEndDate, setLocalEndDate] = useState('');


  const [localDateColumn, setLocalDateColumn] = useState('');


  const [localOrderTypeFilter, setLocalOrderTypeFilter] = useState('');


  const [localItemServiceFilter, setLocalItemServiceFilter] = useState('');


  const [localPaymentTermsFilter, setLocalPaymentTermsFilter] = useState('');


  const [localPaymentTermsSearch, setLocalPaymentTermsSearch] = useState('');


  const [localShowPaymentTermsSuggestions, setLocalShowPaymentTermsSuggestions] = useState(false);


  const [localColumnSearchTerms, setLocalColumnSearchTerms] = useState({});


  const [localActiveSearchColumn, setLocalActiveSearchColumn] = useState(null);



  // Use external state if available, otherwise use local state


  const currentPage = useExternalState ? tableFilters.currentPage : localCurrentPage;


  const setCurrentPage = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, currentPage: value})) 


    : setLocalCurrentPage;



  const itemsPerPage = useExternalState ? tableFilters.itemsPerPage : localItemsPerPage;


  const setItemsPerPage = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, itemsPerPage: value})) 


    : setLocalItemsPerPage;



  const searchTerm = useExternalState ? tableFilters.searchTerm : localSearchTerm;


  const setSearchTerm = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, searchTerm: value})) 


    : setLocalSearchTerm;



  const sortConfig = useExternalState ? tableFilters.sortConfig : localSortConfig;


  const setSortConfig = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, sortConfig: value})) 


    : setLocalSortConfig;



  const filters = useExternalState ? tableFilters.filters : localFilters;


  const setFilters = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, filters: value})) 


    : setLocalFilters;



  const showDateFilter = useExternalState ? tableFilters.showDateFilter : localShowDateFilter;


  const setShowDateFilter = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, showDateFilter: value})) 


    : setLocalShowDateFilter;



  const dateFilterMode = useExternalState ? tableFilters.dateFilterMode : localDateFilterMode;


  const setDateFilterMode = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, dateFilterMode: value})) 


    : setLocalDateFilterMode;



  const selectedDate = useExternalState ? tableFilters.selectedDate : localSelectedDate;


  const setSelectedDate = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, selectedDate: value})) 


    : setLocalSelectedDate;



  const startDate = useExternalState ? tableFilters.startDate : localStartDate;


  const setStartDate = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, startDate: value})) 


    : setLocalStartDate;



  const endDate = useExternalState ? tableFilters.endDate : localEndDate;


  const setEndDate = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, endDate: value})) 


    : setLocalEndDate;



  const dateColumn = useExternalState ? tableFilters.dateColumn : localDateColumn;


  const setDateColumn = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, dateColumn: value})) 


    : setLocalDateColumn;



  const orderTypeFilter = useExternalState ? tableFilters.orderTypeFilter : localOrderTypeFilter;


  const setOrderTypeFilter = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, orderTypeFilter: value})) 


    : setLocalOrderTypeFilter;



  const itemServiceFilter = useExternalState ? tableFilters.itemServiceFilter : localItemServiceFilter;


  const setItemServiceFilter = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, itemServiceFilter: value})) 


    : setLocalItemServiceFilter;



  const paymentTermsFilter = useExternalState ? tableFilters.paymentTermsFilter : localPaymentTermsFilter;


  const setPaymentTermsFilter = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, paymentTermsFilter: value})) 


    : setLocalPaymentTermsFilter;



  const paymentTermsSearch = useExternalState ? tableFilters.paymentTermsSearch : localPaymentTermsSearch;


  const setPaymentTermsSearch = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, paymentTermsSearch: value})) 


    : setLocalPaymentTermsSearch;



  const showPaymentTermsSuggestions = useExternalState ? tableFilters.showPaymentTermsSuggestions : localShowPaymentTermsSuggestions;


  const setShowPaymentTermsSuggestions = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, showPaymentTermsSuggestions: value})) 


    : setLocalShowPaymentTermsSuggestions;



  const columnSearchTerms = useExternalState ? tableFilters.columnSearchTerms : localColumnSearchTerms;


  const setColumnSearchTerms = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, columnSearchTerms: value})) 


    : setLocalColumnSearchTerms;



  const activeSearchColumn = useExternalState ? tableFilters.activeSearchColumn : localActiveSearchColumn;


  const setActiveSearchColumn = useExternalState 


    ? (value) => setTableFilters(prev => ({...prev, activeSearchColumn: value})) 


    : setLocalActiveSearchColumn;





  // Get unique values for each column (for filter dropdowns)


  const getUniqueValues = (columnName) => {


    const values = new Set();


    data.forEach(row => {


      const value = row[columnName];


      if (value !== null && value !== undefined && value !== '') {


        values.add(String(value));


      }


    });


    return Array.from(values).sort();


  };





  // Determine if column should use search input instead of dropdown


  const shouldUseSearchFilter = (columnName) => {


    const uniqueValues = getUniqueValues(columnName);


    const columnLower = columnName.toLowerCase();


    


    // Use search for columns with many unique values (> 15)


    if (uniqueValues.length > 15) return true;


    


    // Always use search for these column types


    const searchColumns = ['vendor', 'customer', 'supplier', 'name', 'description', 'remarks', 'notes', 'address', 'contact'];


    if (searchColumns.some(col => columnLower.includes(col))) return true;


    


    // Never use search for date columns


    if (dateColumns.includes(columnName)) return false;


    


    return false;


  };





  // Get filtered suggestions for search columns


  const getFilteredSuggestions = (columnName, searchTerm) => {


    if (!searchTerm) return [];


    const uniqueValues = getUniqueValues(columnName);


    return uniqueValues


      .filter(value => 


        String(value).toLowerCase().includes(searchTerm.toLowerCase())


      )


      .slice(0, 10); // Limit to 10 suggestions


  };





  // Detect date columns


  const dateColumns = useMemo(() => {


    if (!data || data.length === 0) return [];


    const cols = displayColumns.filter(col => {


      const sampleValue = data[0][col];


      if (!sampleValue) return false;


      // Check if it looks like a date


      const str = String(sampleValue);


      return str.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/) || 


             str.match(/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/) ||


             col.toLowerCase().includes('date');


    });


    return cols;


  }, [data, displayColumns]);





  // Detect item code column (#_1)


  const itemCodeColumn = useMemo(() => {


    if (!data || data.length === 0) return null;


    // Look for column named '#_1' or similar


    const possibleNames = ['#_1', '#_1_1', 'item_code', 'itemcode', 'item code'];


    for (let name of possibleNames) {


      if (displayColumns.includes(name)) {


        return name;


      }


    }


    // Look for any column starting with # (but not just '#')


    const hashColumn = displayColumns.find(col => col.startsWith('#') && col !== '#');


    if (hashColumn) return hashColumn;


    


    return null;


  }, [data, displayColumns]);





  // Detect Item/Service column


  const itemServiceColumn = useMemo(() => {


    if (!data || data.length === 0) return null;


    // Look for column containing "item/service" or "document type"


    const possibleNames = [


      'Item / service', 


      'Item/Service', 


      'item/service',


      'Document Type',


      'document type',


      'Type',


      'Item Service'


    ];


    


    for (let name of possibleNames) {


      const found = displayColumns.find(col => 


        col.toLowerCase() === name.toLowerCase() || 


        col.toLowerCase().includes(name.toLowerCase())


      );


      if (found) return found;


    }


    


    return null;


  }, [data, displayColumns]);





  // Get Item/Service counts


  const itemServiceCounts = useMemo(() => {


    if (!itemServiceColumn || !data) {


      return { 'Item': 0, 'Service': 0 };


    }


    


    const counts = { 'Item': 0, 'Service': 0 };


    data.forEach(row => {


      const value = String(row[itemServiceColumn] || '').trim();


      if (value.toLowerCase() === 'item') {


        counts['Item']++;


      } else if (value.toLowerCase() === 'service') {


        counts['Service']++;


      }


    });


    


    return counts;


  }, [data, itemServiceColumn]);





  // Detect Payment Terms column


  const paymentTermsColumn = useMemo(() => {


    if (!data || data.length === 0) return null;


    // Look for column containing "payment terms"


    const possibleNames = [


      'Payment Terms',


      'payment terms',


      'Payment Term',


      'payment term',


      'Terms',


      'terms'


    ];


    


    for (let name of possibleNames) {


      const found = displayColumns.find(col => 


        col.toLowerCase() === name.toLowerCase() ||


        (col.toLowerCase().includes('payment') && col.toLowerCase().includes('term'))


      );


      if (found) return found;


    }


    


    return null;


  }, [data, displayColumns]);





  // Get unique payment terms


  const paymentTermsOptions = useMemo(() => {


    if (!paymentTermsColumn || !data) return [];


    


    const terms = new Set();


    data.forEach(row => {


      const value = String(row[paymentTermsColumn] || '').trim();


      if (value) {


        terms.add(value);


      }


    });


    


    return Array.from(terms).sort();


  }, [data, paymentTermsColumn]);





  // Get order type counts


  const orderTypeCounts = useMemo(() => {


    if (!itemCodeColumn || !data) {


      return { '1': 0, '2': 0, '3': 0 };


    }


    


    const counts = { '1': 0, '2': 0, '3': 0 };


    data.forEach(row => {


      const itemCode = String(row[itemCodeColumn] || '');


      const firstDigit = itemCode.charAt(0);


      if (firstDigit === '1' || firstDigit === '2' || firstDigit === '3') {


        counts[firstDigit]++;


      }


    });


    


    return counts;


  }, [data, itemCodeColumn]);





  // Parse date from various formats


  const parseDate = (dateStr) => {


    if (!dateStr) return null;


    const str = String(dateStr).trim();


    


    // Try to split by common delimiters


    const parts = str.split(/[/-]/);


    


    if (parts.length === 3) {


      let [first, second, third] = parts.map(p => parseInt(p, 10));


      


      // Handle 2-digit yea(assume 20xx if < 100)


      if (third < 100) {


        third = 2000 + third;


      }


      if (first < 100 && first > 31) {


        first = 2000 + first;


      }


      


      // YYYY-MM-DD or YYYY/MM/DD format


      if (first > 1000) {


        const date = new Date(first, second - 1, third);


        // Validate the date


        if (date.getFullYear() === first && 


            date.getMonth() === second - 1 && 


            date.getDate() === third) {


          return date;


        }


      }


      


      // MM/DD/YYYY or MM-DD-YYYY format (most common in US)


      if (third > 1000) {


        const date = new Date(third, first - 1, second);


        // Validate the date


        if (date.getFullYear() === third && 


            date.getMonth() === first - 1 && 


            date.getDate() === second) {


          return date;


        }


      }


      


      // DD/MM/YYYY or DD-MM-YYYY format (common in Europe/Asia)


      if (third > 1000 && first <= 31 && second <= 12) {


        const date = new Date(third, second - 1, first);


        // Validate the date


        if (date.getFullYear() === third && 


            date.getMonth() === second - 1 && 


            date.getDate() === first) {


          return date;


        }


      }


    }


    


    // Try native Date parsing as fallback


    const parsed = new Date(dateStr);


    if (!isNaN(parsed.getTime())) {


      return parsed;


    }


    


    return null;


  };





  // Filter data based on search and filters


  const filteredData = useMemo(() => {


    // FIRST: Filter out completely empty rows (safety net in case backend missed any)


    let filtered = data.filter(row => {


      const values = Object.values(row);


      // Check if row has at least one meaningful value


      const hasData = values.some(value => {


        if (value === null || value === undefined || value === '') return false;


        if (typeof value === 'string') {


          const trimmed = value.trim();


          return trimmed !== '' && trimmed !== '-';


        }


        return true; // Numbers, booleans, etc. are considered data


      });


      return hasData;


    });





    // Apply search filter


    if (searchTerm) {


      filtered = filtered.filter(row =>


        Object.values(row).some(value =>


          String(value).toLowerCase().includes(searchTerm.toLowerCase())


        )


      );


    }





    // Apply column filte(exact match for dropdowns)


    Object.keys(filters).forEach(column => {


      if (filters[column]) {


        filtered = filtered.filter(row =>


          String(row[column]) === filters[column]


        );


      }


    });





    // Apply column search filte(partial match for search inputs)


    Object.keys(columnSearchTerms).forEach(column => {


      if (columnSearchTerms[column]) {


        filtered = filtered.filter(row =>


          String(row[column] || '').toLowerCase().includes(columnSearchTerms[column].toLowerCase())


        );


      }


    });





    // Apply order type filter (based on first digit of item code)


    if (orderTypeFilter && itemCodeColumn) {


      filtered = filtered.filter(row => {


        const itemCode = String(row[itemCodeColumn] || '');


        return itemCode.charAt(0) === orderTypeFilter;


      });


    }





    // Apply Item/Service filter


    if (itemServiceFilter && itemServiceColumn) {


      filtered = filtered.filter(row => {


        const value = String(row[itemServiceColumn] || '').trim().toLowerCase();


        return value === itemServiceFilter.toLowerCase();


      });


    }





    // Apply Payment Terms filter


    if (paymentTermsFilter && paymentTermsColumn) {


      filtered = filtered.filter(row => {


        const value = String(row[paymentTermsColumn] || '').trim();


        return value === paymentTermsFilter;


      });


    }





    // Apply date filter


    if (dateColumn && (selectedDate || (startDate && endDate))) {


      filtered = filtered.filter(row => {


        const rowDate = parseDate(row[dateColumn]);


        if (!rowDate) return false;





        // Normalize dates to ignore time component


        const normalizeDate = (date) => {


          const d = new Date(date);


          d.setHours(0, 0, 0, 0);


          return d;


        };





        const normalizedRowDate = normalizeDate(rowDate);





        if (dateFilterMode === 'exact' && selectedDate) {


          const filterDate = normalizeDate(new Date(selectedDate + 'T00:00:00'));


          return normalizedRowDate.getTime() === filterDate.getTime();


        } else if (dateFilterMode === 'range' && startDate && endDate) {


          const start = normalizeDate(new Date(startDate + 'T00:00:00'));


          const end = normalizeDate(new Date(endDate + 'T00:00:00'));


          


          const rowTime = normalizedRowDate.getTime();


          const startTime = start.getTime();


          const endTime = end.getTime();


          


          return rowTime >= startTime && rowTime <= endTime;


        }


        return true;


      });


    }





    return filtered;


  }, [data, searchTerm, filters, columnSearchTerms, dateColumn, selectedDate, startDate, endDate, dateFilterMode, orderTypeFilter, itemCodeColumn, itemServiceFilter, itemServiceColumn, paymentTermsFilter, paymentTermsColumn]);





  // Sort data


  const sortedData = useMemo(() => {


    let sorted = [...filteredData];





    if (sortConfig.key) {


      sorted.sort((a, b) => {


        const aValue = a[sortConfig.key];


        const bValue = b[sortConfig.key];





        if (aValue === null || aValue === undefined) return 1;


        if (bValue === null || bValue === undefined) return -1;





        // Try numeric comparison


        const aNum = Number(aValue);


        const bNum = Number(bValue);


        if (!isNaN(aNum) && !isNaN(bNum)) {


          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;


        }





        // String comparison


        const aStr = String(aValue).toLowerCase();


        const bStr = String(bValue).toLowerCase();


        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;


        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;


        return 0;


      });


    }





    return sorted;


  }, [filteredData, sortConfig]);





  // Pagination


  const totalPages = Math.ceil(sortedData.length / itemsPerPage);


  const startIndex = (currentPage - 1) * itemsPerPage;


  const endIndex = startIndex + itemsPerPage;


  const currentData = sortedData.slice(startIndex, endIndex);





  // Calculate totals for numeric columns (for filtered data)


  const columnTotals = useMemo(() => {


    const totals = {};


    


    if (sortedData.length === 0) return totals;





    // Columns to exclude from summation


    const excludedColumns = [


      '#', '#_1', '#_1_1', '#_2', // ID/Item code columns


      'item_code', 'itemcode', 'item code', // Item code variants


      'id', 'ID', 'Id', // Generic ID columns


      'order_id', 'customer_id', 'vendor_id', // Specific ID columns


      'code', 'reference', 'ref' // Reference columns


    ];





    displayColumns.forEach(column => {


      // Skip excluded columns


      const columnLower = column.toLowerCase();


      const isExcluded = excludedColumns.some(ex => 


        column === ex || 


        columnLower === ex.toLowerCase() ||


        column.startsWith('#') // Exclude any column starting with #


      );





      if (isExcluded) return;





      let sum = 0;


      let numericCount = 0;


      let totalCount = 0;





      sortedData.forEach(row => {


        const value = row[column];


        if (value !== null && value !== undefined && value !== '') {


          totalCount++;


          // Remove commas and convert to number


          const cleanValue = String(value).replace(/,/g, '').trim();


          const numValue = Number(cleanValue);


          


          // Only add if it's a valid number


          if (!isNaN(numValue) && cleanValue !== '') {


            sum += numValue;


            numericCount++;


          }


        }


      });





      // Only store total if:


      // 1. At least 80% of non-empty values are numeric (to handle columns with mostly numbers)


      // 2. Has at least one numeric value


      // 3. Sum is not zero (to avoid showing 0.00 totals)


      const isNumericColumn = totalCount > 0 && (numericCount / totalCount) >= 0.8;


      


      if (isNumericColumn && numericCount > 0 && sum !== 0) {


        totals[column] = sum;


        


        // Log calculation details for verification (useful for debugging)


        if (column.toLowerCase().includes('document total') || column.toLowerCase().includes('doc total')) {


          console.log(`✓ Column: "${column}"`, {


            totalRows: sortedData.length,


            validNumericValues: numericCount,


            calculatedSum: sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })


          });


        }


      }


    });





    return totals;


  }, [sortedData, displayColumns]);





  const handleSort = (columnName) => {


    setSortConfig(prevConfig => ({


      key: columnName,


      direction: prevConfig.key === columnName && prevConfig.direction === 'asc' ? 'desc' : 'asc'


    }));


  };





  const handleFilterChange = (column, value) => {


    setFilters(prev => ({


      ...prev,


      [column]: value


    }));


    setCurrentPage(1);


  };





  const handlePageChange = (page) => {


    setCurrentPage(page);


  };





  const handleItemsPerPageChange = (e) => {


    setItemsPerPage(Number(e.target.value));


    setCurrentPage(1);


  };





  const clearFilters = () => {

    if (useExternalState) {
      // Reset all filters in external state
      setTableFilters(prev => ({
        ...prev,
        currentPage: 1,
        filters: {},
        columnSearchTerms: {},
        searchTerm: '',
        sortConfig: { key: null, direction: 'asc' },
        selectedDate: '',
        startDate: '',
        endDate: '',
        dateColumn: '',
        showDateFilter: false,
        orderTypeFilter: '',
        itemServiceFilter: '',
        paymentTermsFilter: '',
        paymentTermsSearch: '',
        showPaymentTermsSuggestions: false,
        activeSearchColumn: null
      }));
    } else {
      // Use local setters
      setFilters({});
      setColumnSearchTerms({});
      setSearchTerm('');
      setSortConfig({ key: null, direction: 'asc' });
      setSelectedDate('');
      setStartDate('');
      setEndDate('');
      setDateColumn('');
      setShowDateFilter(false);
      setOrderTypeFilter('');
      setItemServiceFilter('');
      setPaymentTermsFilter('');
      setPaymentTermsSearch('');
      setShowPaymentTermsSuggestions(false);
      setActiveSearchColumn(null);
      setCurrentPage(1);
    }


  };





  // Check if any filters are currently active


  const hasActiveFilters = useMemo(() => {


    // Check column filters


    if (Object.keys(filters).length > 0 && Object.values(filters).some(v => v !== '')) return true;


    // Check search terms


    if (Object.keys(columnSearchTerms).length > 0 && Object.values(columnSearchTerms).some(v => v !== '')) return true;


    // Check global search


    if (searchTerm) return true;


    // Check date filters


    if (selectedDate || startDate || endDate) return true;


    // Check order type filter


    if (orderTypeFilter) return true;


    // Check item/service filter


    if (itemServiceFilter) return true;


    // Check payment terms filter


    if (paymentTermsFilter) return true;


    


    return false;


  }, [filters, columnSearchTerms, searchTerm, selectedDate, startDate, endDate, orderTypeFilter, itemServiceFilter, paymentTermsFilter]);





  const handleOrderTypeFilter = (type) => {


    if (orderTypeFilter === type) {


      // If clicking the same button, clear the filter


      setOrderTypeFilter('');


    } else {


      // Set the new filter


      setOrderTypeFilter(type);


    }


    setCurrentPage(1);


  };





  const handleItemServiceFilter = (type) => {


    if (itemServiceFilter === type) {


      // If clicking the same button, clear the filter


      setItemServiceFilter('');


    } else {


      // Set the new filter


      setItemServiceFilter(type);


    }


    setCurrentPage(1);


  };





  const handleColumnSearchChange = (column, value) => {


    setColumnSearchTerms(prev => ({


      ...prev,


      [column]: value


    }));


    setCurrentPage(1);


  };





  const handleSuggestionClick = (column, value) => {


    setColumnSearchTerms(prev => ({


      ...prev,


      [column]: value


    }));


    setActiveSearchColumn(null);


    setCurrentPage(1);


  };





  const clearColumnSearch = (column) => {


    setColumnSearchTerms(prev => {


      const newTerms = { ...prev };


      delete newTerms[column];


      return newTerms;


    });


    setCurrentPage(1);


  };





  // Handler for payment terms search


  const handlePaymentTermsSearch = (value) => {


    setPaymentTermsSearch(value);


    if (value) {


      setShowPaymentTermsSuggestions(true);


    } else {


      setShowPaymentTermsSuggestions(false);


    }


  };





  // Handler for selecting a payment term from suggestions


  const selectPaymentTerm = (term) => {


    setPaymentTermsFilter(term);


    setPaymentTermsSearch('');


    setShowPaymentTermsSuggestions(false);


    setCurrentPage(1);


  };





  // Get filtered payment terms based on search


  const getFilteredPaymentTerms = () => {


    if (!paymentTermsSearch) return paymentTermsOptions;


    return paymentTermsOptions.filter(term =>


      term.toLowerCase().includes(paymentTermsSearch.toLowerCase())


    );


  };





  const applyDateFilter = () => {


    if (!dateColumn) {


      alert('š ℹ¸ Please select a date column first!');


      return;


    }


    if (dateFilterMode === 'exact' && !selectedDate) {


      alert('š ℹ¸ Please select a date!');


      return;


    }


    if (dateFilterMode === 'range') {


      if (!startDate || !endDate) {


        alert('š ℹ¸ Please select both start and end dates!');


        return;


      }


      // Validate that end date is not before start date


      const start = new Date(startDate);


      const end = new Date(endDate);


      if (end < start) {


        alert('š ℹ¸ End date cannot be before start date!');


        return;


      }


    }


    setCurrentPage(1);


    setShowDateFilter(false);


  };





  const clearDateFilter = () => {


    setSelectedDate('');


    setStartDate('');


    setEndDate('');


    setDateColumn('');


    setCurrentPage(1);


  };





  const getSortIcon = (columnName) => {


    if (sortConfig.key !== columnName) return '⇅';


    return sortConfig.direction === 'asc' ? '↑' : '↓';


  };





  // Generate pagination buttons


  const getPaginationButtons = () => {


    const buttons = [];


    const maxButtons = 7;


    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));


    let endPage = Math.min(totalPages, startPage + maxButtons - 1);





    if (endPage - startPage < maxButtons - 1) {


      startPage = Math.max(1, endPage - maxButtons + 1);


    }





    for (let i = startPage; i <= endPage; i++) {


      buttons.push(i);


    }





    return buttons;


  };





  if (!data || data.length === 0) {


    return (


      <div className="data-table-container">


        <div className="no-data">


          <p>📊 No data to display</p>


        </div>


      </div>


    );


  }





  return (


    <div className="data-table-container">


      <div className="table-header">


        <h2>📋 Sales Data ({sortedData.length.toLocaleString()} records)</h2>


        


        <div className="table-controls">


          <input


            type="text"


            placeholder=" Search across all columns..."


            value={searchTerm}


            onChange={(e) => {


              setSearchTerm(e.target.value);


              setCurrentPage(1);


            }}


            className="search-input"


          />





          {dateColumns.length > 0 && (


            <button 


              className="btn-date-filter" 


              onClick={() => setShowDateFilter(true)}


              title="Filter by date"


            >


              📅 Date Filter


            </button>


          )}





          {dateColumn && (selectedDate || (startDate && endDate)) && (


            <button 


              className="btn-clear-date" 


              onClick={clearDateFilter}


              title="Clear date filter"


            >


              ❌ Clear Date


            </button>


          )}





          <button className="btn-clear-filters" onClick={clearFilters}>


            Clear All Filters


          </button>





          {onShowAnalysis && filteredData.length > 0 && (


            <button 


              className="btn-show-analysis" 


              onClick={() => onShowAnalysis({ 


                data: filteredData, 


                columns: Object.keys(data[0] || {}).reduce((acc, key) => {


                  acc[key] = key;


                  return acc;


                }, {}),


                filterInfo: {


                  dateRange: selectedDate || (startDate && endDate) ? {


                    selectedDate,


                    startDate,


                    endDate,


                    dateColumn


                  } : null,


                  orderType: orderTypeFilter,


                  itemService: itemServiceFilter,


                  totalRecords: filteredData.length,


                  originalRecords: data.length,


                  hasActiveFilters: hasActiveFilters


                }


              })}


              title={hasActiveFilters ? "Show analysis of filtered data" : "Show analysis of all data"}


              style={{


                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',


                color: 'white',


                border: 'none',


                padding: '8px 16px',


                borderRadius: '6px',


                cursor: 'pointer',


                fontSize: '14px',


                fontWeight: '600',


                display: 'flex',


                alignItems: 'center',


                gap: '8px',


                boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',


                transition: 'all 0.3s ease'


              }}


            >


              📊 Show Analysis {hasActiveFilters&& <span style={{ fontSize: '12px', opacity: 0.9 }}>(Filtered)</span>}


            </button>


          )}


        </div>


      </div>





      {/* Order Type Filter Buttons */}


      {itemCodeColumn && (


        <div className="order-type-filter">


          <div className="filter-label">Filter by Order Type:</div>


          <div className="order-type-buttons">


            <button


              className={`order-type-btn import-order ${orderTypeFilter === '1' ? 'active' : ''}`}


              onClick={() => handleOrderTypeFilter('1')}


              title="Filter Import Orde(Item codes starting with 1)"


            >


              <span className="order-number">1</span>


              <span className="order-label">Import Order</span>


              <span className="order-count">({orderTypeCounts['1']})</span>


            </button>


            <button


              className={`order-type-btn local-order ${orderTypeFilter === '2' ? 'active' : ''}`}


              onClick={() => handleOrderTypeFilter('2')}


              title="Filter Local Orde(Item codes starting with 2)"


            >


              <span className="order-number">2</span>


              <span className="order-label">Local Order</span>


              <span className="order-count">({orderTypeCounts['2']})</span>


            </button>


            <button


              className={`order-type-btn job-order ${orderTypeFilter === '3' ? 'active' : ''}`}


              onClick={() => handleOrderTypeFilter('3')}


              title="Filter Job Orde(Item codes starting with 3)"


            >


              <span className="order-number">3</span>


              <span className="order-label">Job Order</span>


              <span className="order-count">({orderTypeCounts['3']})</span>


            </button>


          </div>


          {orderTypeFilter && (


            <div className="active-order-filter">


              <span className="filter-icon">✓</span>


              Showing {orderTypeFilter === '1' ? 'Import' : orderTypeFilter === '2' ? 'Local' : 'Job'} Ordeonly


              <button className="clear-order-filter" onClick={() => setOrderTypeFilter('')}>


                ✕ Clear


              </button>


            </div>


          )}


        </div>


      )}





      {/* Item/Service Filter Buttons */}


      {itemServiceColumn && (


        <div className="item-service-filter">


          <div className="filter-label">📦 Filter by Document Type:</div>


          <div className="item-service-buttons">


            <button


              className={`item-service-btn item-btn ${itemServiceFilter === 'Item' ? 'active' : ''}`}


              onClick={() => handleItemServiceFilter('Item')}


              title="Filter Items only"


            >


              <span className="doc-icon">📦</span>


              <span className="doc-label">Item</span>


              <span className="doc-count">({itemServiceCounts['Item']})</span>


            </button>


            <button


              className={`item-service-btn service-btn ${itemServiceFilter === 'Service' ? 'active' : ''}`}


              onClick={() => handleItemServiceFilter('Service')}


              title="Filter Services only"


            >


              <span className="doc-icon">🔧</span>


              <span className="doc-label">Service</span>


              <span className="doc-count">({itemServiceCounts['Service']})</span>


            </button>


          </div>


          {itemServiceFilter && (


            <div className="active-item-service-filter">


              <span className="filter-icon">✓</span>


              Showing {itemServiceFilter}s only


              <button className="clear-item-service-filter" onClick={() => setItemServiceFilter('')}>


                ✕ Clear


              </button>


            </div>


          )}


        </div>


      )}





      {/* Payment Terms Filter Dropdown with Search */}


      {paymentTermsColumn && paymentTermsOptions.length > 0 && (


        <div className="payment-terms-filter">


          <div className="filter-label">💳 Filter by Payment Terms:</div>


          <div className="payment-terms-dropdown">


            <div className="payment-terms-search-wrapper">


              <input


                type="text"


                className="payment-terms-search-input"


                placeholder={paymentTermsFilter || "Search or select payment terms..."}


                value={paymentTermsSearch}


                onChange={(e) => handlePaymentTermsSearch(e.target.value)}


                onFocus={() => setShowPaymentTermsSuggestions(true)}


                onBlur={() => setTimeout(() => setShowPaymentTermsSuggestions(false), 200)}


              />


              {paymentTermsFilter && (


                <span className="selected-payment-term">


                  ✓ {paymentTermsFilter}


                </span>


              )}


              {showPaymentTermsSuggestions && (paymentTermsSearch || !paymentTermsFilter) && (


                <div className="payment-terms-suggestions">


                  {!paymentTermsSearch && (


                    <div


                      className="payment-term-suggestion"


                      onMouseDown={(e) => {


                        e.preventDefault();


                        selectPaymentTerm('');


                      }}


                    >


                      <span className="suggestion-icon">🔄</span>


                      All Payment Terms


                    </div>


                  )}


                  {getFilteredPaymentTerms().map((term, index) => (


                    <div


                      key={index}


                      className="payment-term-suggestion"


                      onMouseDown={(e) => {


                        e.preventDefault();


                        selectPaymentTerm(term);


                      }}


                    >


                      <span className="suggestion-icon">💳</span>


                      {term}


                    </div>


                  ))}


                  {getFilteredPaymentTerms().length === 0 && (


                    <div className="no-suggestions">


                      No payment terms found


                    </div>


                  )}


                </div>


              )}


            </div>


            {paymentTermsFilter && (


              <button


                className="clear-payment-terms"


                onClick={() => {


                  setPaymentTermsFilter('');


                  setPaymentTermsSearch('');


                }}


                title="Clear payment terms filter"


              >


                ✕ Clear


              </button>


            )}


          </div>


          {paymentTermsFilter && (


            <div className="active-payment-terms-filter">


              <span className="filter-icon">✓</span>


              Showing "{paymentTermsFilter}" terms only


            </div>


          )}


        </div>


      )}





      {/* Date Filter Modal */}


      {showDateFilter && (


        <div className="date-filter-modal">


          <div className="date-filter-content">


            <div className="date-filter-header">


              <h3>📅 Filter by Date</h3>


              <button 


                className="close-modal" 


                onClick={() => setShowDateFilter(false)}


              >


                ✕


              </button>


            </div>





            <div className="date-filter-body">


              {/* Date Column Selection */}


              <div className="filter-group">


                <label>Select Date Column:</label>


                <select 


                  value={dateColumn} 


                  onChange={(e) => setDateColumn(e.target.value)}


                  className="date-column-select"


                >


                  <option value="">-- Choose a date column --</option>


                  {dateColumns.map((col, idx) => (


                    <option key={idx} value={col}>{col}</option>


                  ))}


                </select>


              </div>





              {/* Filter Mode Selection */}


              <div className="filter-group">


                <label>Filter Mode:</label>


                <div className="filter-mode-buttons">


                  <button


                    className={`mode-btn ${dateFilterMode === 'exact' ? 'active' : ''}`}


                    onClick={() => setDateFilterMode('exact')}


                  >


                    📅 Exact Date


                  </button>


                  <button


                    className={`mode-btn ${dateFilterMode === 'range' ? 'active' : ''}`}


                    onClick={() => setDateFilterMode('range')}


                  >


                    📆 Date Range


                  </button>


                </div>


              </div>





              {/* Exact Date Selection */}


              {dateFilterMode === 'exact' && (


                <div className="filter-group">


                  <label>Select Date:</label>


                  <input


                    type="date"


                    value={selectedDate}


                    onChange={(e) => setSelectedDate(e.target.value)}


                    className="date-input"


                  />


                </div>


              )}





              {/* Date Range Selection */}


              {dateFilterMode === 'range' && (


                <div className="filter-group">


                  <label>Select Date Range:</label>


                  <div className="date-range-inputs">


                    <div className="date-input-wrapper">


                      <label className="date-label">From:</label>


                      <input


                        type="date"


                        value={startDate}


                        onChange={(e) => setStartDate(e.target.value)}


                        className="date-input"


                      />


                    </div>


                    <div className="date-input-wrapper">


                      <label className="date-label">To:</label>


                      <input


                        type="date"


                        value={endDate}


                        onChange={(e) => setEndDate(e.target.value)}


                        className="date-input"


                        min={startDate}


                      />


                    </div>


                  </div>


                </div>


              )}





              {/* Active Filter Display */}


              {dateColumn && (selectedDate || (startDate && endDate)) && (


                <div className="active-filter-display">


                  <strong>Active Filter:</strong>


                  <p>


                    Column: <span className="highlight">{dateColumn}</span>


                    {dateFilterMode === 'exact' && selectedDate && (


                      <> | Date: <span className="highlight">{new Date(selectedDate).toLocaleDateString()}</span></>


                    )}


                    {dateFilterMode === 'range' && startDate && endDate && (


                      <> | Range: <span className="highlight">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span></>


                    )}


                  </p>


                </div>


              )}


            </div>





            <div className="date-filter-footer">


              <button 


                className="btn-cancel" 


                onClick={() => setShowDateFilter(false)}


              >


                Cancel


              </button>


              <button 


                className="btn-apply" 


                onClick={applyDateFilter}


              >


                Apply Filter


              </button>


            </div>


          </div>


        </div>


      )}





      <div className="table-info">


        <p>


          Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length.toLocaleString()} records


          {totalRecords > data.length && ` (Total: ${totalRecords.toLocaleString()})`}


        </p>


        


        <div className="items-per-page">


          <label>Rows per page:</label>


          <select value={itemsPerPage} onChange={handleItemsPerPageChange}>


            <option value="25">25</option>


            <option value="50">50</option>


            <option value="100">100</option>


            <option value="200">200</option>


          </select>


        </div>


      </div>





      <div className="table-wrapper">


        <table className="data-table">


          <thead>


            <tr>


              <th className="row-number">#</th>


              {displayColumns.map((column, index) => (


                <th key={index}>


                  <div className="th-content">


                    <span onClick={() => handleSort(column)} className="sortable">


                      {column} {getSortIcon(column)}


                    </span>


                    {column === itemCodeColumn ? (


                      // Special dropdown for item code column showing order types


                      <select


                        className="column-filter order-type-select"


                        value={orderTypeFilter}


                        onChange={(e) => handleOrderTypeFilter(e.target.value)}


                        onClick={(e) => e.stopPropagation()}


                      >


                        <option value="">All Orders</option>


                        <option value="1">🔵 Import Orde({orderTypeCounts['1']})</option>


                        <option value="2">🟢 Local Orde({orderTypeCounts['2']})</option>


                        <option value="3">🟠 Job Orde({orderTypeCounts['3']})</option>


                      </select>


                    ) : column === itemServiceColumn ? (


                      // Special dropdown for Item/Service column


                      <select


                        className="column-filter item-service-select"


                        value={itemServiceFilter}


                        onChange={(e) => handleItemServiceFilter(e.target.value)}


                        onClick={(e) => e.stopPropagation()}


                      >


                        <option value="">All Types</option>


                        <option value="Item">📦 Items ({itemServiceCounts['Item']})</option>


                        <option value="Service">🔧 Services ({itemServiceCounts['Service']})</option>


                      </select>


                    ) : column === paymentTermsColumn ? (


                      // Special search/dropdown for Payment Terms column


                      <div className="column-search-wrapper payment-terms-column-search">


                        <input


                          type="text"


                          className="column-search-input payment-terms-input"


                          placeholder={paymentTermsFilter || "Search terms..."}


                          value={paymentTermsSearch}


                          onChange={(e) => handlePaymentTermsSearch(e.target.value)}


                          onFocus={() => setShowPaymentTermsSuggestions(true)}


                          onBlur={() => setTimeout(() => setShowPaymentTermsSuggestions(false), 200)}


                          onClick={(e) => e.stopPropagation()}


                        />


                        {paymentTermsFilter && (


                          <>


                            <span className="payment-terms-badge">✓</span>


                            <button


                              className="clear-column-search"


                              onClick={(e) => {


                                e.stopPropagation();


                                setPaymentTermsFilter('');


                                setPaymentTermsSearch('');


                              }}


                              title="Clear payment terms"


                            >


                              ✕


                            </button>


                          </>


                        )}


                        {showPaymentTermsSuggestions && (paymentTermsSearch || !paymentTermsFilter) && (


                          <div className="search-suggestions payment-terms-suggestions-dropdown">


                            {!paymentTermsSearch && (


                              <div


                                className="suggestion-item"


                                onMouseDown={(e) => {


                                  e.preventDefault();


                                  selectPaymentTerm('');


                                }}


                              >


                                <span className="suggestion-icon">🔄</span>


                                All Payment Terms


                              </div>


                            )}


                            {getFilteredPaymentTerms().map((term, idx) => (


                              <div


                                key={idx}


                                className="suggestion-item"


                                onMouseDown={(e) => {


                                  e.preventDefault();


                                  selectPaymentTerm(term);


                                }}


                              >


                                <span className="suggestion-icon">💳</span>


                                {term}


                              </div>


                            ))}


                            {getFilteredPaymentTerms().length === 0 && (


                              <div className="suggestion-item no-suggestions">


                                No payment terms found


                              </div>


                            )}


                          </div>


                        )}


                      </div>


                    ) : dateColumns.includes(column) ? (


                      // Hide filter for date columns (use main date filter instead)


                      <span className="no-filter">Use Date Filter</span>


                    ) : shouldUseSearchFilter(column) ? (


                      // Search input for columns with many values (vendors, etc.)


                      <div className="column-search-wrapper">


                        <input


                          type="text"


                          className="column-search-input"


                          placeholder="Search..."


                          value={columnSearchTerms[column] || ''}


                          onChange={(e) => handleColumnSearchChange(column, e.target.value)}


                          onFocus={() => setActiveSearchColumn(column)}


                          onBlur={() => setTimeout(() => setActiveSearchColumn(null), 200)}


                          onClick={(e) => e.stopPropagation()}


                        />


                        {columnSearchTerms[column] && (


                          <button


                            className="clear-column-search"


                            onClick={(e) => {


                              e.stopPropagation();


                              clearColumnSearch(column);


                            }}


                            title="Clear search"


                          >


                            ✕


                          </button>


                        )}


                        {activeSearchColumn === column && columnSearchTerms[column] && (


                          <div className="search-suggestions">


                            {getFilteredSuggestions(column, columnSearchTerms[column]).map((suggestion, idx) => (


                              <div


                                key={idx}


                                className="suggestion-item"


                                onMouseDown={(e) => {


                                  e.preventDefault();


                                  handleSuggestionClick(column, suggestion);


                                }}


                              >


                                {suggestion}


                              </div>


                            ))}


                          </div>


                        )}


                      </div>


                    ) : (


                      // Regular dropdown for columns with few values


                      <select


                        className="column-filter"


                        value={filters[column] || ''}


                        onChange={(e) => handleFilterChange(column, e.target.value)}


                        onClick={(e) => e.stopPropagation()}


                      >


                        <option value="">All</option>


                        {getUniqueValues(column).slice(0, 50).map((value, idx) => (


                          <option key={idx} value={value}>


                            {value}


                          </option>


                        ))}


                      </select>


                    )}


                  </div>


                </th>


              ))}


            </tr>


          </thead>


          <tbody>


            {currentData.map((row, rowIndex) => (


              <tr key={rowIndex}>


                <td className="row-number">{startIndex + rowIndex + 1}</td>


                {displayColumns.map((column, colIndex) => (


                  <td key={colIndex} title={String(row[column] || '')}>


                    {row[column] !== null && row[column] !== undefined ? String(row[column]) : '-'}


                  </td>


                ))}


              </tr>


            ))}


          </tbody>


        </table>


      </div>





      {/* Summary Totals Footer */}


      {Object.keys(columnTotals).length > 0 && (


        <div className="table-summary">


          <div className="summary-header">


            <span className="summary-icon">📊</span>


            <h3>Summary Totals</h3>


            <span className="summary-count">


              Calculated from {sortedData.length.toLocaleString()} filtered {sortedData.length === 1 ? 'record' : 'records'}


              {sortedData.length < data.length && (


                <span className="filter-indicator"> (filtered from {data.length.toLocaleString()} total)</span>


              )}


            </span>


          </div>


          <div className="summary-content">


            {displayColumns.map((column, index) => {


              if (columnTotals[column] !== undefined) {


                return (


                  <div key={index} className="summary-item">


                    <div className="summary-label">{column}</div>


                    <div className="summary-value">


                      {columnTotals[column].toLocaleString(undefined, {


                        minimumFractionDigits: 2,


                        maximumFractionDigits: 2


                      })}


                    </div>


                  </div>


                );


              }


              return null;


            })}


          </div>


          <div className="summary-footer-note">


            <span className="note-icon">ℹ</span>


            <span className="note-text">


              Totals are calculated from currently filtered/visible data only. 


              Clear all filters to see totals for complete dataset.


            </span>


          </div>


        </div>


      )}





      {totalPages > 1 && (


        <div className="pagination">


          <button


            className="page-btn"


            onClick={() => handlePageChange(1)}


            disabled={currentPage === 1}


          >


            ® First


          </button>


          


          <button


            className="page-btn"


            onClick={() => handlePageChange(currentPage - 1)}


            disabled={currentPage === 1}


          >


            † Prev


          </button>





          {getPaginationButtons().map(page => (


            <button


              key={page}


              className={`page-btn ${currentPage === page ? 'active' : ''}`}


              onClick={() => handlePageChange(page)}


            >


              {page}


            </button>


          ))}





          <button


            className="page-btn"


            onClick={() => handlePageChange(currentPage + 1)}


            disabled={currentPage === totalPages}


          >


            Next →


          </button>





          <button


            className="page-btn"


            onClick={() => handlePageChange(totalPages)}


            disabled={currentPage === totalPages}


          >


            Last ­


          </button>


        </div>


      )}


    </div>


  );


};





export default DataTable;














