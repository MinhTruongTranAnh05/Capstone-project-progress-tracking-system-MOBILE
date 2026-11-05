import { staffApi } from './staffApi';
import type { GroupFilter, StudentGroup } from '../domain/models';

export async function collectGroups(semester: string, filter: GroupFilter): Promise<StudentGroup[]> {
  const first = await staffApi.groups(semester, { ...filter, page: 0, size: 100 });
  const groups = [...first.content];
  for (let page = 1; page < first.totalPages; page++) {
    const next = await staffApi.groups(semester, { ...filter, page, size: 100 });
    groups.push(...next.content);
  }
  return groups;
}
