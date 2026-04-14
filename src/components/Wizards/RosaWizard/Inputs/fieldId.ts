export function fieldIdFromPath(props: { id?: string; path: string }): string {
  if (props.id) return props.id;
  return props.path?.toLowerCase().split('.').join('-') ?? '';
}
