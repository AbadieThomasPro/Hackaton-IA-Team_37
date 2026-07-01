import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { ChatMessage } from '../models/message.model';

const HISTORY_KEY = 'techcorp-chat-history';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  private readonly chatService = inject(ChatService);

  readonly messages = signal<ChatMessage[]>(this.loadHistory());
  readonly draft = signal('');
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);

  private loadHistory(): ChatMessage[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  }

  private saveHistory(): void {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(this.messages()));
  }

  private appendMessage(message: ChatMessage): void {
    this.messages.update((msgs) => [...msgs, message]);
  }

  private appendToLastMessage(delta: string): void {
    this.messages.update((msgs) => {
      const updated = [...msgs];
      const last = updated[updated.length - 1];
      updated[updated.length - 1] = { ...last, content: last.content + delta };
      return updated;
    });
  }

  async send(): Promise<void> {
    const content = this.draft().trim();
    if (!content || this.sending()) return;

    this.error.set(null);
    this.draft.set('');

    const history = this.messages().map(({ role, content }) => ({ role, content }));
    history.push({ role: 'user', content });

    this.appendMessage({ id: crypto.randomUUID(), role: 'user', content, ts: Date.now() });
    this.appendMessage({ id: crypto.randomUUID(), role: 'assistant', content: '', ts: Date.now() });
    this.saveHistory();

    this.sending.set(true);
    try {
      for await (const delta of this.chatService.streamReply(history)) {
        this.appendToLastMessage(delta);
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      this.sending.set(false);
      this.saveHistory();
    }
  }

  clearHistory(): void {
    this.messages.set([]);
    localStorage.removeItem(HISTORY_KEY);
  }
}
