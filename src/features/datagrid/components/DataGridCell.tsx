// src/features/datagrid/components/DataGridCell.tsx
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { createMotionTransition } from '../config/motionSettings';

type DataGridCellProps = {
  children: ReactNode;
  className?: string;
};

const CELL_TRANSITION = createMotionTransition('fast');

export const DataGridCell: React.FC<DataGridCellProps> = ({
  children,
  className,
}) => {
  return (
    <td className={className}>
      <motion.div
        layout
        initial={{ opacity: 0, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 2 }}
        transition={CELL_TRANSITION}
        className="contents"
      >
        {children}
      </motion.div>
    </td>
  );
};
