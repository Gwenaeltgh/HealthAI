import React from 'react';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';

type Column<Row> = {
  header: string;
  accessor: keyof Row | string;
  cell?: (row: Row) => React.ReactNode;
  className?: string;
};

interface TableProps<Row extends Record<string, any>> {
  columns: Array<Column<Row>>;
  data: Row[];
  rowKey?: (row: Row, index: number) => string;
}

const Table = <Row extends Record<string, any>>({ columns, data, rowKey }: TableProps<Row>) => {
  const { t } = useAppPreferences();

  return (
    <div className="surface-solid overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] lg:min-w-full">
          <thead className="bg-white/70 backdrop-blur">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.accessor)}
                  className={`px-4 py-3 text-left text-[11px] font-semibold tracking-wide text-slate-600 border-b border-slate-200/70 ${
                    column.className ?? ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 bg-white/90">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowKey ? rowKey(row, rowIndex) : String(rowIndex)}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.accessor)}
                      className={`px-4 py-3.5 text-sm text-slate-800 ${column.className ?? ''}`}
                    >
                      {column.cell
                        ? column.cell(row)
                        : (row as any)[column.accessor as any] ?? (
                            <span className="text-slate-400">—</span>
                          )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
                  <div className="mx-auto max-w-sm">
                    <div className="text-sm font-semibold text-slate-800">{t('common.noResults')}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Essayez d’ajuster les filtres, la recherche ou la période.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;