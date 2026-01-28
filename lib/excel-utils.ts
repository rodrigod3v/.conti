import ExcelJS from "exceljs";

export interface ExcelData {
  data: any[];
  headers: string[];
}

/**
 * Converts an Excel file buffer to JSON format
 * @param buffer - ArrayBuffer from the Excel file
 * @returns Object containing data array and headers array
 */
export async function excelToJson(buffer: ArrayBuffer): Promise<ExcelData> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const worksheet = workbook.worksheets[0];
  
  if (!worksheet) {
    throw new Error("Nenhuma planilha encontrada no arquivo");
  }
  
  const jsonData: any[] = [];
  const headers: string[] = [];
  
  // Extract headers from first row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const value = cell.value;
    // Handle different cell value types
    const headerValue = value?.toString() || `Column${colNumber}`;
    headers.push(headerValue);
  });
  
  // Convert rows to JSON objects
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          // Get cell value, handling formulas and rich text
          let cellValue: any = cell.value;
          
          // Handle formula results
          if (cellValue && typeof cellValue === 'object' && 'result' in cellValue) {
            cellValue = cellValue.result;
          }
          
          // Handle rich text
          if (cellValue && typeof cellValue === 'object' && 'richText' in cellValue) {
            cellValue = (cellValue as any).richText
              .map((rt: any) => rt.text)
              .join('');
          }
          
          rowData[header] = cellValue;
        }
      });
      
      // Only add row if it has at least one non-empty value
      if (Object.values(rowData).some(val => val !== null && val !== undefined && val !== '')) {
        jsonData.push(rowData);
      }
    }
  });
  
  return { data: jsonData, headers };
}
