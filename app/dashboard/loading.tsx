// app/dashboard/loading.tsx
// Skeleton loading tự động hiển thị khi dashboard page đang fetch dữ liệu

export default function DashboardLoading() {
  return (
    <div style={{ paddingBottom: "calc(68px + 12px)" }}>

      {/* ── Hero skeleton ── */}
      <div style={{
        background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)",
        padding: "44px 20px 48px",
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 90, height: 20, background: "rgba(255,255,255,0.12)", backgroundSize: "800px 100%" }} />
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.12)", backgroundSize: "800px 100%" }} />
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: 6 }}>
          <div className="skeleton" style={{ width: 120, height: 13, marginBottom: 6, background: "rgba(255,255,255,0.1)", backgroundSize: "800px 100%" }} />
          <div className="skeleton" style={{ width: 180, height: 22, marginBottom: 4, background: "rgba(255,255,255,0.14)", backgroundSize: "800px 100%" }} />
          <div className="skeleton" style={{ width: 90,  height: 11, background: "rgba(255,255,255,0.08)", backgroundSize: "800px 100%" }} />
        </div>

        {/* Balance card */}
        <div style={{ marginTop: 16 }}>
          <div className="skeleton" style={{
            height: 80, borderRadius: 16,
            background: "rgba(255,255,255,0.08)", backgroundSize: "800px 100%",
          }} />
        </div>
      </div>

      {/* ── Stat cards floating ── */}
      <div style={{ padding: "0 16px", marginTop: -36, marginBottom: 20, position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          {[0, 1].map(i => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 14 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 80, borderRadius: 14 }} />
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Quick Insight */}
        <div className="skeleton" style={{ height: 96, borderRadius: 14 }} />

        {/* Month Goal */}
        <div className="skeleton" style={{ height: 110, borderRadius: 14 }} />

        {/* Chart */}
        <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />

        {/* Recent transactions */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="skeleton" style={{ width: 160, height: 18, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 70,  height: 14, borderRadius: 8 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: "60%", height: 13, marginBottom: 6, borderRadius: 6 }} />
                  <div className="skeleton" style={{ width: "35%", height: 11, borderRadius: 6 }} />
                </div>
                <div className="skeleton" style={{ width: 70, height: 16, borderRadius: 6 }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
