
import { Component, ChangeDetectionStrategy, signal, inject, OnInit, ElementRef, viewChild, effect } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chat } from '@google/genai';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component.ts';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule, CommonModule, LoadingSpinnerComponent],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent implements OnInit {
  private geminiService = inject(GeminiService);
  private chatContainer = viewChild<ElementRef<HTMLDivElement>>('chatContainer');
  
  chatSession = signal<Chat | undefined>(undefined);
  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      // Scroll to bottom when messages change
      if (this.messages() && this.chatContainer()) {
        const element = this.chatContainer()!.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  ngOnInit() {
    try {
      this.chatSession.set(this.geminiService.createChatSession());
      this.messages.set([{ role: 'model', text: 'Hello! How can I help you today? Ask me anything or request content like an email marketing campaign.' }]);
    } catch (e) {
      const error = e as Error;
      this.error.set(error.message);
      console.error(e);
    }
  }

  async sendMessage(): Promise<void> {
    const userMessage = this.userInput().trim();
    if (!userMessage || this.isLoading() || !this.chatSession()) return;

    this.isLoading.set(true);
    this.userInput.set('');
    this.messages.update(m => [...m, { role: 'user', text: userMessage }]);
    this.error.set(null);
    
    // Add a placeholder for the model's response
    this.messages.update(m => [...m, { role: 'model', text: '' }]);

    try {
      const stream = await this.chatSession()!.sendMessageStream({ message: userMessage });

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        this.messages.update(currentMessages => {
          const lastMessage = currentMessages[currentMessages.length - 1];
          lastMessage.text += chunkText;
          return [...currentMessages];
        });
      }
    } catch (e) {
      const error = e as Error;
      const errorMessage = 'Sorry, something went wrong. Please try again.';
      this.messages.update(currentMessages => {
          const lastMessage = currentMessages[currentMessages.length - 1];
          lastMessage.text = errorMessage;
          return [...currentMessages];
      });
      this.error.set(errorMessage);
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
