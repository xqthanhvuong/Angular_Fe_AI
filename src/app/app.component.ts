import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  personName: string | null = null;
  newPersonName: string = '';
  selectedFiles: File[] = [];
  filesForNewPerson: File[] = [];
  selectedFileNamePerson: String | null = null;
  capturedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  selectedFileNames: string | null = null;
  selectedImages: string[] = [];

  constructor(private http: HttpClient) {}


  // Chọn ảnh từ máy tính
onFilesSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.selectedFileNames = file.name;

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
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera.jpg", { type: "image/jpeg" });
        this.capturedFile = file;

        const reader = new FileReader();
        reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
        // Sau khi đã có file, gọi submitImage
        this.submitImage();
      })
      .catch(err => {
        console.error("Lỗi capture ảnh từ camera:", err);
      });
  }

  // Gửi ảnh đã chọn lên backend để nhận diện
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
  

  // Chọn ảnh cho người mới
  onFilesSelectedForNewPerson(event: any) {
    const files = event.target.files;
    this.selectedImages = [];
  
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
}
