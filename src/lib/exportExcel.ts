/**
 * Real Excel (.xlsx) export utility powered by SheetJS
 */

import * as XLSX from 'xlsx';

export interface ExportColumn<T> {
  header: string;
  key: keyof T | string;
  formatter?: (item: T) => any;
  width?: number;
}

export function exportToExcel<T = any>(
  data: T[],
  columnsOrPrefix: ExportColumn<T>[] | string,
  fileNamePrefixOrSheet: string = 'Sheet1',
  sheetName: string = 'Sheet1'
) {
  let rows: Record<string, any>[] = [];
  let fileNamePrefix = 'Export';
  let actualSheet = sheetName;

  if (typeof columnsOrPrefix === 'string') {
    // Called as exportToExcel(rows, 'FileNamePrefix', 'SheetName')
    rows = data as any;
    fileNamePrefix = columnsOrPrefix;
    actualSheet = fileNamePrefixOrSheet || 'Sheet1';
  } else {
    // Called as exportToExcel(data, columns, 'FileNamePrefix', 'SheetName')
    const columns = columnsOrPrefix;
    fileNamePrefix = fileNamePrefixOrSheet;
    rows = data.map((item) => {
      const rowObj: Record<string, any> = {};
      columns.forEach((col) => {
        if (col.formatter) {
          rowObj[col.header] = col.formatter(item);
        } else {
          rowObj[col.header] = (item as any)[col.key] ?? '';
        }
      });
      return rowObj;
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, actualSheet.substring(0, 31));

  const today = '2026-11-02';
  const fullFileName = `${fileNamePrefix}_${today}.xlsx`;

  XLSX.writeFile(workbook, fullFileName);
}

export function exportMonthlyManagementPack(data: {
  summaryRows: any[];
  renewalsRows: any[];
  productRows: any[];
  commissionsRows: any[];
  claimsAgeingRows: any[];
  mpesaReconRows: any[];
}) {
  const workbook = XLSX.utils.book_new();

  // 1. Summary Sheet
  const wsSummary = XLSX.utils.json_to_sheet(data.summaryRows);
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Summary');

  // 2. Renewals Sheet
  const wsRenewals = XLSX.utils.json_to_sheet(data.renewalsRows);
  XLSX.utils.book_append_sheet(workbook, wsRenewals, 'Renewals');

  // 3. Premium by Product Sheet
  const wsProduct = XLSX.utils.json_to_sheet(data.productRows);
  XLSX.utils.book_append_sheet(workbook, wsProduct, 'Premium by Product');

  // 4. Commissions Sheet
  const wsCommissions = XLSX.utils.json_to_sheet(data.commissionsRows);
  XLSX.utils.book_append_sheet(workbook, wsCommissions, 'Commissions');

  // 5. Claims Ageing Sheet
  const wsClaims = XLSX.utils.json_to_sheet(data.claimsAgeingRows);
  XLSX.utils.book_append_sheet(workbook, wsClaims, 'Claims Ageing');

  // 6. M-Pesa Reconciliation Sheet
  const wsMpesa = XLSX.utils.json_to_sheet(data.mpesaReconRows);
  XLSX.utils.book_append_sheet(workbook, wsMpesa, 'M-Pesa Reconciliation');

  const today = '2026-11-02';
  const fileName = `Goldfinch_Monthly_Management_Pack_${today}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
