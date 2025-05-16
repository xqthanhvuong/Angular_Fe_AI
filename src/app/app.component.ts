import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
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

  constructor(private http: HttpClient) {}

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
        console.log('Đã thêm người mới:', response);
      },
      (error) => {
        console.error('Lỗi thêm người mới:', error);
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
}
