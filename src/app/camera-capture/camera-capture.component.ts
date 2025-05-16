import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-camera-capture',
  templateUrl: './camera-capture.component.html',
  styleUrls: ['./camera-capture.component.css']
})
export class CameraCaptureComponent {
  @Output() onCapture: EventEmitter<string> = new EventEmitter();
  @Output() onDeleteImage: EventEmitter<number> = new EventEmitter(); // Thêm event để thông báo khi xóa ảnh
  @Input() isMultipleCapture: boolean = false; // Thêm input để biết có cho phép chụp nhiều ảnh hay không

  videoElement: any;
  canvasElement: any;
  context: any;
  isCameraOn: boolean = false; // Trạng thái camera
  videoStream: MediaStream | null = null; // Biến lưu stream của video
  capturedImages: string[] = []; // Mảng lưu URL ảnh đã chụp (cho chế độ nhiều ảnh)

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
      // this.toggleOverlay(false); // Ẩn overlay khi bật camera
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
      // this.toggleOverlay(true); // Hiển thị overlay khi tắt camera
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
  // toggleOverlay(show: boolean) {
  //   const overlay = document.getElementById('camera-overlay') as HTMLDivElement;
  //   overlay.style.display = show ? 'flex' : 'none';
  // }

  captureImage() {
    this.context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
    const imageUrl = this.canvasElement.toDataURL('image/jpeg');
    
    if (this.isMultipleCapture) {
      if (this.capturedImages.length < 12) {
        this.capturedImages.push(imageUrl);
      } else {
        alert("Bạn chỉ được chụp tối đa 12 ảnh.");
        return;
      }
    }
    
    this.onCapture.emit(imageUrl); 
  }
  
  // Xóa một ảnh cụ thể
  deleteImage(index: number) {
    if (this.isMultipleCapture) {
      // Nếu đang ở chế độ multi-capture, thông báo cho component cha biết
      this.onDeleteImage.emit(index);
    } else {
      // Xóa ảnh trong component nếu không phải chế độ multi-capture
      if (index >= 0 && index < this.capturedImages.length) {
        this.capturedImages.splice(index, 1);
      }
    }
  }
  
  // Xóa tất cả các ảnh đã chụp
  clearCapturedImages() {
    this.capturedImages = [];
  }
}
