import { PackageStatus, STATUS_LABELS, STATUS_COLORS } from '../../types';
import { clsx } from 'clsx';

interface Props {
  status: PackageStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        STATUS_COLORS[status],
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
          'px-4 py-1.5 text-base': size === 'lg',
        },
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
