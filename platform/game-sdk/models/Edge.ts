export type EdgeConfig = {
  id: Id;
  from: string;
  to: string;
  bandwidth?: number;
  latency?: number;
};

export class Edge {
  id: Id;
  from: string;
  to: string;
  bandwidth?: number;
  latency?: number;

  constructor({ id, from, to, bandwidth = 0, latency = 0 }: EdgeConfig) {
    this.id = id || `${from}-${to}`;
    this.from = from;
    this.to = to;
    this.bandwidth = bandwidth;
    this.latency = latency;
  }
}
