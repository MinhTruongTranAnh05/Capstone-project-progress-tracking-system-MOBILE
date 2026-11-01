export const MIN_GROUP_MEMBERS = 3;
export const MAX_GROUP_MEMBERS = 5;
export const GROUP_SIZE_RANGE = `${MIN_GROUP_MEMBERS}–${MAX_GROUP_MEMBERS}`;
export function isValidGroupSize(size: number) { return size >= MIN_GROUP_MEMBERS && size <= MAX_GROUP_MEMBERS; }
