import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-camera-capture',
  templateUrl: './camera-capture.component.html',
  styleUrls: ['./camera-capture.component.css']
})
export class CameraCaptureComponent {
  @Output() onCapture: EventEmitter<string> = new EventEmitter();

  videoElement: any;
  canvasElement: any;
  context: any;

  ngOnInit(): void {
    this.videoElement = document.getElementById('video') as HTMLVideoElement;
    this.canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    this.context = this.canvasElement.getContext('2d');

    // Mở camera
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      this.videoElement.srcObject = stream;
    });
  }

  captureImage() {
    this.context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
    const imageUrl = this.canvasElement.toDataURL('image/jpeg');
    this.onCapture.emit(imageUrl);  // Gửi ảnh đã chụp lên parent component
  }
}
