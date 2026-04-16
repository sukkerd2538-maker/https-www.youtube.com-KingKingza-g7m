
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { GeminiService, AspectRatio } from '../../services/gemini.service';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component.ts';

@Component({
  selector: 'app-image-generator',
  imports: [FormsModule, LoadingSpinnerComponent],
  templateUrl: './image-generator.component.html',
  styleUrls: ['./image-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGeneratorComponent {
  private geminiService = inject(GeminiService);
  
  prompt = signal('');
  aspectRatio = signal<AspectRatio>('1:1');
  isLoading = signal(false);
  generatedImage = signal<string | null>(null);
  error = signal<string | null>(null);

  readonly aspectRatios: { value: AspectRatio, label: string }[] = [
    { value: '1:1', label: 'Square' },
    { value: '16:9', label: 'Widescreen' },
    { value: '9:16', label: 'Portrait' },
    { value: '4:3', label: 'Landscape' },
    { value: '3:4', label: 'Tall' },
  ];

  async generateImage(): Promise<void> {
    if (!this.prompt().trim()) {
      this.error.set('Please enter a prompt.');
      return;
    }

    this.isLoading.set(true);
    this.generatedImage.set(null);
    this.error.set(null);

    try {
      const image = await this.geminiService.generateImage(this.prompt(), this.aspectRatio());
      this.generatedImage.set(image);
    } catch (e) {
      const error = e as Error;
      this.error.set(error.message);
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
