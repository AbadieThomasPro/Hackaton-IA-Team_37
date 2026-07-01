import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChatRole } from '../models/message.model';

export interface ChatRequestMessage {
  role: ChatRole;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  // Consomme le flux NDJSON repipe par le back (meme format que l'API Ollama :
  // une ligne JSON par chunk, { message: { content }, done }).
  async *streamReply(messages: ChatRequestMessage[]): AsyncGenerator<string> {
    const response = await fetch(`${environment.apiBaseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok || !response.body) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.error || `Le serveur a repondu avec le statut ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const chunk = JSON.parse(line);
        if (chunk.message?.content) {
          yield chunk.message.content as string;
        }
      }
    }
  }
}
