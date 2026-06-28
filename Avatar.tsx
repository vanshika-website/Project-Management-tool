import { avatarColor, initials } from '../lib/meta';

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const bg = avatarColor(name);
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0 ring-2 ring-white"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.36 }}
      title={name || 'Unassigned'}
    >
      {initials(name)}
    </span>
  );
}
