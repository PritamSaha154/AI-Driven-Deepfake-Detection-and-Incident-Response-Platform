'use client';

import { Badge } from '@/components/ui/badge';
import type { MetadataField } from '@/types';

interface MetadataTableProps {
  metadata: MetadataField[];
}

export function MetadataTable({ metadata }: MetadataTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Field
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Value
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {metadata.map((field, index) => (
            <tr
              key={index}
              className={`hover:bg-gray-50 ${
                field.status === 'suspicious' ? 'bg-red-50' : ''
              }`}
            >
              <td className="px-4 py-3 text-gray-600 font-medium">
                {field.field}
              </td>
              <td className="px-4 py-3 text-gray-900">{field.value}</td>
              <td className="px-4 py-3">
                <Badge
                  variant="outline"
                  className={
                    field.status === 'valid'
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : field.status === 'suspicious'
                        ? 'border-red-500 text-red-600 bg-red-50'
                        : field.status === 'invalid'
                          ? 'border-red-600 text-red-700 bg-red-100'
                          : 'border-gray-400 text-gray-600 bg-gray-50'
                  }
                >
                  {field.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
