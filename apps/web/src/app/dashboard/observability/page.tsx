export default function ObservabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Observability</h1>
        <p className="text-muted-foreground">
          Monitor AI request logs, latency, token usage, and provider errors.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="p-6 border rounded-xl bg-background">
          <p className="text-xs text-muted-foreground">Total Requests</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
        <div className="p-6 border rounded-xl bg-background">
          <p className="text-xs text-muted-foreground">Avg Latency</p>
          <p className="text-2xl font-bold mt-1">— ms</p>
        </div>
        <div className="p-6 border rounded-xl bg-background">
          <p className="text-xs text-muted-foreground">Errors</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
        <div className="p-6 border rounded-xl bg-background">
          <p className="text-xs text-muted-foreground">Est. Cost</p>
          <p className="text-2xl font-bold mt-1">$0.00</p>
        </div>
      </div>

      <div className="p-6 border rounded-xl bg-background">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Recent AI Requests</h3>
        <p className="text-sm text-muted-foreground">No requests logged yet.</p>
      </div>
    </div>
  )
}
