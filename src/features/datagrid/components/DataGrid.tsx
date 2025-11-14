type DataRow = {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Inactive" | "Pending";
};

const baseNames: string[] = [
  "Alice Johnson",
  "Bob Smith",
  "Carlos Martinez",
  "Diana Lee",
  "Evelyn Garcia",
  "Frank Miller",
  "Grace Kim",
  "Henry Brown",
  "Isabella Rossi",
  "Jack Wilson",
];

const baseStatuses: DataRow["status"][] = ["Active", "Inactive", "Pending"];

const staticRows: DataRow[] = Array.from({ length: 60 }, (_, index) => {
  const name = baseNames[index % baseNames.length];
  const status = baseStatuses[index % baseStatuses.length];
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, ".");

  return {
    id: index + 1,
    name,
    email: `${slug}${index + 1}@example.com`,
    status,
  };
});

function getStatusBadgeClasses(status: DataRow["status"]): string {
  switch (status) {
    case "Active":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
    case "Pending":
      return "bg-amber-500/10 text-amber-200 border-amber-500/40";
    case "Inactive":
    default:
      return "bg-slate-700/40 text-slate-200 border-slate-500/40";
  }
}

export function DataGrid() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Accounts</h2>
          <p className="mt-1 text-xs text-slate-400">
            Static in-memory dataset (Phase 1 – no sorting, no filters, no
            virtualization).
          </p>
        </div>

        <span className="text-xs text-slate-500">
          {staticRows.length} rows
        </span>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-inner">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur">
            <tr className="border-b border-slate-800">
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {staticRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-900/60 odd:bg-slate-900/40 even:bg-slate-950/40 hover:bg-slate-800/60 transition-colors"
              >
                <td className="px-4 py-2 align-middle text-xs text-slate-400">
                  #{row.id.toString().padStart(3, "0")}
                </td>
                <td className="px-4 py-2 align-middle text-sm font-medium text-slate-100">
                  {row.name}
                </td>
                <td className="px-4 py-2 align-middle text-xs text-slate-300">
                  <span className="font-mono">{row.email}</span>
                </td>
                <td className="px-4 py-2 align-middle">
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      getStatusBadgeClasses(row.status),
                    ].join(" ")}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
