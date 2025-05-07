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
  isCameraOn: boolean = false; // Trạng thái camera
  videoStream: MediaStream | null = null; // Biến lưu stream của video

  ngOnInit(): void {
    this.videoElement = document.getElementById('video') as HTMLVideoElement;
    this.canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    this.context = this.canvasElement.getContext('2d');
  }

  // Hàm để bắt đầu camera
  startCamera() {
    if (this.isCameraOn) return; // Nếu camera đang bật thì không làm gì
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      this.videoElement.srcObject = stream;
      this.videoStream = stream;
      this.isCameraOn = true;
      this.toggleOverlay(false); // Ẩn overlay khi bật camera
    }).catch((err) => {
      console.error("Lỗi khi mở camera: ", err);
      alert("Không thể mở camera.");
    });
  }

  // Hàm để dừng camera
  stopCamera() {
    if (!this.isCameraOn) return; // Nếu camera đã tắt thì không làm gì
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop()); // Dừng tất cả các track
      this.videoElement.srcObject = null;
      this.videoStream = null;
      this.isCameraOn = false;
      this.toggleOverlay(true); // Hiển thị overlay khi tắt camera
    }
  }

  // Hàm điều khiển bật/tắt camera
  toggleCamera() {
    if (this.isCameraOn) {
      this.stopCamera();
    } else {
      this.startCamera();
    }
  }

  // Hàm để điều khiển hiển thị overlay
  toggleOverlay(show: boolean) {
    const overlay = document.getElementById('camera-overlay') as HTMLDivElement;
    overlay.style.display = show ? 'flex' : 'none';
  }

  captureImage() {
    this.context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
    const imageUrl = this.canvasElement.toDataURL('image/jpeg');
    this.onCapture.emit(imageUrl); // Gửi ảnh đã chụp ra ngoài component
  }
}
