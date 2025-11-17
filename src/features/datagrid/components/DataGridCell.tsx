// src/features/datagrid/components/DataGridCell.tsx
import type { ReactNode } from 'react';

type DataGridCellProps = {
  children: ReactNode;
  className?: string;
};

export const DataGridCell: React.FC<DataGridCellProps> = ({
  children,
  className,
}) => {
  return <td className={className}>{children}</td>;
};
