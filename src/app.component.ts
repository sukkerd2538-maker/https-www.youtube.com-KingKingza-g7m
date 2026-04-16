
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { ImageGeneratorComponent } from './components/image-generator/image-generator.component';

type View = 'chat' | 'image';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [ChatbotComponent, ImageGeneratorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  activeView = signal<View>('chat');

  setView(view: View) {
    this.activeView.set(view);
  }
}
