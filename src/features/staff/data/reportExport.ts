import { isAxiosError } from 'axios';
import { staffApi } from './staffApi';
import { saveWorkbook } from './fileTransfer';
import { validateWorkbook, workbookName } from '../domain/workbook';

export async function exportReport(semester: string): Promise<void> {
  try {
    const response = await staffApi.exportExcel(semester);
    const contentType = response.headers['content-type'];
    const disposition = response.headers['content-disposition'];
    validateWorkbook(response.status, typeof contentType === 'string' ? contentType : undefined, response.data);
    await saveWorkbook(response.data, workbookName(typeof disposition === 'string' ? disposition : undefined, `Danh_sach_ghep_nhom_${semester.replace(/[^A-Za-z0-9_-]/g, '_')}.xlsx`));
  } catch (error) {
    if (isAxiosError(error) && error.response?.data instanceof ArrayBuffer) {
      try {
        const text = decodeURIComponent(Array.from(new Uint8Array(error.response.data), b => `%${b.toString(16).padStart(2, '0')}`).join(''));
        error.response.data = JSON.parse(text);
      } catch { /* Keep an unrecognized server response as an error. */ }
    }
    throw error;
  }
}
