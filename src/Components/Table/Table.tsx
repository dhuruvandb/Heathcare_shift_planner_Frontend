import React, { useState, useCallback, useMemo } from "react";
import Loading from "../Loader/Loading";

export type Column<T> = {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
  loading?: boolean;
};

function useSort<T>(data: T[], sortConfig: { key: keyof T; direction: "asc" | "desc" } | null) {
  return useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      return (aVal > bVal ? 1 : -1) * (sortConfig.direction === "asc" ? 1 : -1);
    });
  }, [data, sortConfig]);
}

const Table = <T,>({ columns, data, className = "", loading = false }: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);

  const handleSort = useCallback((accessor: keyof T) => {
    setSortConfig((prevConfig) => {
      if (prevConfig?.key === accessor) {
        return {
          key: accessor,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: accessor, direction: "asc" };
    });
  }, []);

  const sortedData = useSort(data, sortConfig);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 py-2 text-left font-semibold text-gray-600 cursor-pointer"
                onClick={() => column.sortable !== false && handleSort(column.accessor)}
              >
                {column.header}
                {sortConfig?.key === column.accessor && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 relative">
          {loading && (
            <tr className="absolute inset-0 flex items-center justify-center z-10 bg-[rgba(0,0,0,0.05)]">
              <td colSpan={columns.length} className="text-center py-10">
                <Loading />
              </td>
            </tr>
          )}
          {!loading && sortedData.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-gray-600">
                No data available.
              </td>
            </tr>
          )}
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-4 py-2 text-gray-700">
                  {column.render ? column.render(row[column.accessor], row) : String(row[column.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
