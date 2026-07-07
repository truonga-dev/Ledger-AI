// app/dashboard/reports/loading.tsx

export default function ReportsLoading() {
  return (
    <div style={{ padding: "20px 16px calc(68px + 20px)" }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 130, height: 22, marginBottom: 8, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 190, height: 14, borderRadius: 8 }} />
      </div>

      {/* Month picker tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ flex: 1, height: 38, borderRadius: 12 }} />
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: 80, borderRadius: 14, marginBottom: 20 }} />

      {/* Chart */}
      <div className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 20 }} />

      {/* Category table */}
      <div style={{ marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 140, height: 16, marginBottom: 12, borderRadius: 8 }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: `${55 + i * 8}%`, height: 13, borderRadius: 6 }} />
            </div>
            <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 6 }} />
          </div>
        ))}
      </div>

      {/* Export button */}
      <div className="skeleton" style={{ height: 48, borderRadius: 14 }} />
    </div>
  );
}
