import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CameraCaptureComponent } from './camera-capture/camera-capture.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('newPersonCamera') newPersonCamera?: CameraCaptureComponent;
  @ViewChild('fileUploads') fileUploadsInput?: ElementRef;
  @ViewChild('fileInput') fileInput?: ElementRef;
  @ViewChild('mainCamera') mainCamera?: CameraCaptureComponent;
  
  activeTab: string = 'upload';
  personName: string | null = null;
  newPersonName: string = '';
  selectedFiles: File[] = [];
  filesForNewPerson: File[] = [];
  selectedFileNamePerson: String | null = null;
  capturedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  selectedFileNames: string | null = null;
  selectedImages: string[] = [];
  isDraggingOver: boolean = false;
  isDraggingOverNewPerson: boolean = false;
  hasSelectedImages: boolean = false;
  hasSelectedImageForNewPerson: boolean = false;
  isCapturingForNewPerson: boolean = false; 

  constructor(private http: HttpClient) {}

  // Phương thức để chuyển tab và xử lý camera
  setActiveTab(tabName: string): void {
    const previousTab = this.activeTab;
    this.activeTab = tabName;
    
    // Tắt camera khi chuyển từ tab camera sang tab khác
    if (previousTab === 'camera' && tabName !== 'camera') {
      if (this.mainCamera) {
        this.mainCamera.stopCamera();
      }
    }
    
    // Tắt camera khi chuyển từ tab addPerson (đang chụp ảnh) sang tab khác
    if (previousTab === 'addPerson' && tabName !== 'addPerson' && this.isCapturingForNewPerson) {
      if (this.newPersonCamera) {
        this.newPersonCamera.stopCamera();
      }
    }
  }

  // Chọn ảnh từ máy tính
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.hasSelectedImages = true;
      const file = input.files[0];
      this.selectedFileNames = file.name;
      this.selectedFiles = [file];
      this.capturedFile = null;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Chức năng nhận diện khuôn mặt từ camera
  captureImage(imageUrl: string) {
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' });
        this.capturedFile = file;
        this.hasSelectedImages = true;
        
        // Tắt camera trước khi chuyển tab
        if (this.mainCamera) {
          this.mainCamera.stopCamera();
        }
        
        this.activeTab = 'upload';

        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      })
      .catch((err) => {
        alert('Lỗi chụp ảnh từ camera');
        console.error('Lỗi capture ảnh từ camera:', err);
      });
  }
  
  // Xử lý khi chụp ảnh cho người mới
  captureImageForNewPerson(imageUrl: string) {
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const fileName = `new_person_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        this.filesForNewPerson.push(file);
        this.hasSelectedImageForNewPerson = true;
        
        // Thêm vào danh sách ảnh hiển thị
        this.selectedImages.push(imageUrl);
      })
      .catch((err) => {
        alert('Lỗi chụp ảnh từ camera');
        console.error('Lỗi capture ảnh từ camera:', err);
      });
  }
  
  // Xóa một ảnh đã chụp cho người mới
  deleteImageForNewPerson(index: number) {
    if (index >= 0 && index < this.selectedImages.length) {
      this.filesForNewPerson.splice(index, 1);
      this.selectedImages.splice(index, 1);
      
      if (this.fileUploadsInput && this.fileUploadsInput.nativeElement) {
        this.fileUploadsInput.nativeElement.value = '';
      }
      
      if (this.selectedImages.length === 0) {
        this.hasSelectedImageForNewPerson = false;
      }
    }
  }
  
  clearImagesForNewPerson() {
    this.selectedImages = [];
    this.filesForNewPerson = [];
    this.hasSelectedImageForNewPerson = false;
    
    if (this.fileUploadsInput && this.fileUploadsInput.nativeElement) {
      this.fileUploadsInput.nativeElement.value = '';
    }
    
    if (this.newPersonCamera) {
      this.newPersonCamera.clearCapturedImages();
    }
  }
  
  toggleCameraForNewPerson() {
    this.isCapturingForNewPerson = !this.isCapturingForNewPerson;
    
    if (this.isCapturingForNewPerson) {
      this.selectedImages = [];
      this.filesForNewPerson = [];
      this.hasSelectedImageForNewPerson = false;
    } else {
      if (this.newPersonCamera) {
        this.newPersonCamera.clearCapturedImages();
      }
    }
  }

  submitImage() {
    const formData = new FormData();
    let fileToSend: File | null = null;

    if (this.capturedFile) {
      fileToSend = this.capturedFile;
    } else if (this.selectedFiles.length > 0) {
      fileToSend = this.selectedFiles[0];
    }

    if (fileToSend) {
      formData.append('image', fileToSend, fileToSend.name);

      this.http.post('http://localhost:5000/identify', formData).subscribe(
        (response: any) => {
          this.personName = response.person;
          console.log('Nhận diện người:', this.personName);
        },
        (error) => {
          console.error('Lỗi gửi ảnh:', error);
        }
      );
    } else {
      console.log('Không có ảnh nào để gửi!');
    }
  }

  onFilesSelectedForNewPerson(event: any) {
    const files = event.target.files;
    this.selectedImages = [];
    this.filesForNewPerson = [];
    this.hasSelectedImageForNewPerson = true;
    
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.filesForNewPerson.push(file);
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Thêm người mới vào hệ thống
  addNewPerson() {
    if (!this.newPersonName || this.filesForNewPerson.length === 0) {
      alert('Vui lòng nhập tên người mới và chọn ít nhất một ảnh.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.newPersonName);

    // Thêm các ảnh vào FormData
    for (let file of this.filesForNewPerson) {
      formData.append('images', file, file.name);
    }

    this.http.post('http://localhost:5000/add_person', formData).subscribe(
      (response: any) => {
        alert('Đã thêm người mới thành công!');
        this.newPersonName = '';
        this.filesForNewPerson = [];
        this.selectedImages = [];
        this.hasSelectedImageForNewPerson = false;
        this.isCapturingForNewPerson = false;
        if (this.newPersonCamera) {
          this.newPersonCamera.clearCapturedImages();
        }
      },
      (error) => {
        console.error('Lỗi thêm người mới:', error);
        alert('Lỗi khi thêm người mới. Vui lòng thử lại!');
      }
    );
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = true;
  }

  handleDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;
    this.hasSelectedImages = true;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFileNames = file.name;
        this.selectedFiles = [file];
        this.capturedFile = null;

        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  handleDragEnterNewPerson(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOverNewPerson = true;
  }

  handleDragLeaveNewPerson(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOverNewPerson = false;
  }

  handleDragOverNewPerson(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOverNewPerson = true;
  }

  handleDropNewPerson(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOverNewPerson = false;
    this.hasSelectedImageForNewPerson = true;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const files = event.dataTransfer.files;
      this.selectedImages = [];
      this.filesForNewPerson = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          this.filesForNewPerson.push(file);
          
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.selectedImages.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  // Xóa ảnh đã chọn và reset form trong tab upload
  clearUploadImage() {
    this.imagePreviewUrl = null;
    this.selectedFiles = [];
    this.capturedFile = null;
    this.selectedFileNames = null;
    this.hasSelectedImages = false;
    this.personName = null;
    
    // Reset input file để có thể chọn lại file đã xóa
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
