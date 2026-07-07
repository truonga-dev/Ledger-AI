// app/dashboard/transactions/loading.tsx

export default function TransactionsLoading() {
  return (
    <div style={{ padding: "0 0 calc(68px + 12px)" }}>

      {/* Header */}
      <div style={{ padding: "20px 16px 12px" }}>
        <div className="skeleton" style={{ width: 160, height: 22, marginBottom: 8, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 110, height: 14, borderRadius: 8 }} />
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 16px", overflowX: "auto" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: 72, height: 32, borderRadius: 20, flexShrink: 0 }} />
        ))}
      </div>

      {/* Transaction rows */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Date group label */}
        <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 6 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "var(--surface)", borderRadius: 14, padding: "12px 14px",
            border: "1px solid var(--border)",
          }}>
            <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: "55%", height: 14, marginBottom: 6, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: "30%", height: 11, borderRadius: 6 }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="skeleton" style={{ width: 72, height: 16, marginBottom: 4, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 40, height: 11, borderRadius: 6 }} />
            </div>
          </div>
        ))}

        {/* Second group */}
        <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 6, marginTop: 4 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "var(--surface)", borderRadius: 14, padding: "12px 14px",
            border: "1px solid var(--border)",
          }}>
            <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: "65%", height: 14, marginBottom: 6, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: "40%", height: 11, borderRadius: 6 }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="skeleton" style={{ width: 72, height: 16, marginBottom: 4, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 40, height: 11, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
