export interface ImportFile { name: string; data: FormData }
export async function pickImportFile(): Promise<ImportFile | null> {
  const picker = await import('expo-document-picker');
  const result = await picker.getDocumentAsync({ type: ['.csv', '.xls', '.xlsx'], copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset.file) throw new Error('Không thể đọc file đã chọn.');
  const data = new FormData(); data.append('file', asset.file);
  return { name: asset.name, data };
}
export async function saveWorkbook(data: ArrayBuffer, filename: string): Promise<void> {
  const url = URL.createObjectURL(new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a'); link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
