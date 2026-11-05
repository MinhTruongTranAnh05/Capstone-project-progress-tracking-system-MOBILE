export interface ImportFile { name: string; data: FormData }
export async function pickImportFile(): Promise<ImportFile | null> {
  const picker = await import('expo-document-picker');
  const result = await picker.getDocumentAsync({ type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const data = new FormData();
  data.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' } as unknown as Blob);
  return { name: asset.name, data };
}
export async function saveWorkbook(data: ArrayBuffer, filename: string): Promise<void> {
  const { File, Paths } = await import('expo-file-system');
  const sharing = await import('expo-sharing');
  if (!await sharing.isAvailableAsync()) throw new Error('Thiết bị chưa hỗ trợ chia sẻ file.');
  const file = new File(Paths.cache, filename);
  await file.write(new Uint8Array(data));
  await sharing.shareAsync(file.uri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: 'Lưu báo cáo Excel', UTI: 'org.openxmlformats.spreadsheetml.sheet' });
}
