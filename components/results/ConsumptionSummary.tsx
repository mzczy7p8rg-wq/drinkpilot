import { formatCurrency } from "@/lib/currencyFormatting";

export type ConsumptionSummaryRow = {
  key: string;
  label: string;
  quantity: number;
  price: number | null;
  total: number;
};

export default function ConsumptionSummary({
  rows,
  currency,
  quantityLabel = "Cantidad / día",
}: {
  rows: ConsumptionSummaryRow[];
  currency: string;
  quantityLabel?: string;
}) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 sm:mt-10">
      <div className="bg-slate-800 px-4 py-4 font-bold text-white sm:px-6">
        📊 Tu consumo estimado
      </div>

      <div className="divide-y divide-slate-200 sm:hidden">
        {rows.map((row) => (
          <div key={row.key} className="p-4">
            <p className="text-lg font-bold text-slate-900">{row.label}</p>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{quantityLabel}</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {row.quantity}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Precio usado</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {row.price !== null
                    ? formatCurrency(row.price, currency)
                    : "No necesario"}
                </p>

                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="text-xs font-semibold text-sky-700">
                    Total crucero
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {formatCurrency(row.total, currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Bebida</th>
              <th className="p-3 text-center">{quantityLabel}</th>
              <th className="p-3 text-center">Precio usado</th>
              <th className="p-3 text-right">Total crucero</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t">
                <td className="p-3">{row.label}</td>
                <td className="p-3 text-center">{row.quantity}</td>
                <td className="p-3 text-center">
                  {row.price !== null
                    ? formatCurrency(row.price, currency)
                    : "No necesario"}
                </td>
                <td className="p-3 text-right font-semibold">
                  {formatCurrency(row.total, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
