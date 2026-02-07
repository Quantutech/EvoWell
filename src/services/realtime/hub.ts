export type RealtimeTopic = 'messages' | 'notifications' | 'appointments';

export interface RealtimeEvent<TPayload = unknown> {
  id: string;
  topic: RealtimeTopic;
  timestamp: string;
  payload: TPayload;
}

type Handler<TPayload = unknown> = (event: RealtimeEvent<TPayload>) => void;

class RealtimeHub {
  private readonly handlers = new Map<RealtimeTopic, Set<Handler>>();
  private readonly channel =
    typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel('evowell-realtime-hub')
      : null;

  constructor() {
    if (!this.channel) return;

    this.channel.onmessage = (message: MessageEvent<RealtimeEvent>) => {
      const event = message.data;
      this.emit(event);
    };
  }

  publish<TPayload>(topic: RealtimeTopic, payload: TPayload): RealtimeEvent<TPayload> {
    const event: RealtimeEvent<TPayload> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      topic,
      timestamp: new Date().toISOString(),
      payload,
    };

    this.emit(event);
    this.channel?.postMessage(event);
    return event;
  }

  subscribe<TPayload>(topic: RealtimeTopic, handler: Handler<TPayload>): () => void {
    const typedHandler = handler as Handler;
    const existing = this.handlers.get(topic) ?? new Set<Handler>();
    existing.add(typedHandler);
    this.handlers.set(topic, existing);

    return () => {
      const set = this.handlers.get(topic);
      if (!set) return;
      set.delete(typedHandler);
      if (set.size === 0) {
        this.handlers.delete(topic);
      }
    };
  }

  private emit(event: RealtimeEvent) {
    const set = this.handlers.get(event.topic);
    if (!set) return;

    for (const handler of set) {
      try {
        handler(event);
      } catch (error) {
        console.error('Realtime hub handler failed', error);
      }
    }
  }
}

export const realtimeHub = new RealtimeHub();
