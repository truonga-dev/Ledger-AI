// app/dashboard/profile/loading.tsx

export default function ProfileLoading() {
  return (
    <div style={{ padding: "0 0 calc(68px + 12px)" }}>

      {/* Cover + Avatar */}
      <div style={{ position: "relative", marginBottom: 52 }}>
        <div className="skeleton" style={{ height: 160, borderRadius: 0 }} />
        <div style={{ position: "absolute", bottom: -44, left: 20 }}>
          <div className="skeleton" style={{ width: 88, height: 88, borderRadius: 22, border: "3px solid var(--bg)" }} />
        </div>
      </div>

      {/* Shop name + info */}
      <div style={{ padding: "0 20px 24px" }}>
        <div className="skeleton" style={{ width: 160, height: 22, marginBottom: 8, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 130, height: 14, borderRadius: 8 }} />
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 16px", marginBottom: 24 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 70, borderRadius: 14 }} />
        ))}
      </div>

      {/* Form fields */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton" style={{ width: 100, height: 12, marginBottom: 8, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: "100%", height: 46, borderRadius: 12 }} />
          </div>
        ))}
        <div className="skeleton" style={{ height: 50, borderRadius: 14, marginTop: 8 }} />
      </div>
    </div>
  );
}
