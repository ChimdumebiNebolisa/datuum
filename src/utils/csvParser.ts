// Re-export from new canonical location so legacy imports still resolve.
// New code should import from @/parsers directly.
export { parseCSV, validateParsedData as validateCSV, inferColumnTypes, suggestRole, sortData } from '@/parsers/csvParser';
