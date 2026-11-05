export const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export function workbookName(disposition: string | undefined, fallback: string): string {
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plain = disposition?.match(/filename="([^"]+)"|filename=([^;]+)/i);
  let name = plain?.[1] ?? plain?.[2]?.trim() ?? fallback;
  if (encoded) { try { name = decodeURIComponent(encoded); } catch { /* Use the plain filename. */ } }
  name = name.split(/[\\/]/).pop()?.replace(/[<>:"|?*\x00-\x1f]/g, '_') ?? fallback;
  return name.toLowerCase().endsWith('.xlsx') && name !== '.xlsx' ? name : fallback;
}
export function validateWorkbook(status: number, contentType: string | undefined, data: ArrayBuffer): void {
  if (status !== 200 || contentType?.split(';')[0].trim().toLowerCase() !== XLSX_TYPE) {
    throw new Error('Máy chủ không trả về file Excel hợp lệ. Vui lòng thử lại.');
  }
  const bytes = new Uint8Array(data);
  if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b || bytes[2] !== 0x03 || bytes[3] !== 0x04) {
    throw new Error('Nội dung báo cáo Excel không hợp lệ.');
  }
}
