import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";

// Data interface baru
interface TableRowData {
  id: number;
  title: string;
  date: string;
  wordGenerated: number;
  percentage: number;
  status: string;
}

// Contoh data baru
const tableData: TableRowData[] = [
  {
    id: 1,
    title: "Landing Page Copy",
    date: "2025-07-10",
    wordGenerated: 1200,
    percentage: 80,
    status: "Active",
  },
  {
    id: 2,
    title: "Blog Article",
    date: "2025-07-09",
    wordGenerated: 900,
    percentage: 60,
    status: "Pending",
  },
  {
    id: 3,
    title: "Newsletter",
    date: "2025-07-08",
    wordGenerated: 500,
    percentage: 100,
    status: "Active",
  },
  {
    id: 4,
    title: "Product Description",
    date: "2025-07-07",
    wordGenerated: 300,
    percentage: 40,
    status: "Cancel",
  },
  {
    id: 5,
    title: "Ad Copy",
    date: "2025-07-06",
    wordGenerated: 700,
    percentage: 90,
    status: "Active",
  },
];

export default function BasicTableOne() {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleMenuToggle = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Title
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Word Generated
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Percentage
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {row.title}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {row.date}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {row.wordGenerated}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>{row.percentage}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${
                          row.percentage >= 80
                            ? "bg-green-500"
                            : row.percentage >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${row.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleMenuToggle(row.id)}
                  >
                    <span className="text-xl font-bold">⋮</span>
                  </button>
                  {openMenuId === row.id && (
                    <div
                      className="absolute right-4 z-10 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg dark:bg-gray-800 dark:border-gray-700"
                      onMouseLeave={handleMenuClose}
                    >
                      <button
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          handleMenuClose();
                          // handle view action
                        }}
                      >
                        View
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          handleMenuClose();
                          // handle edit action
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          handleMenuClose();
                          // handle delete action
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-white/[0.05]">
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          Total: {tableData.length} items
        </Badge>
      </div>
    </div>
  );
}