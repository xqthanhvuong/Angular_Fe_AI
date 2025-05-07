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
  selectedFileName: string | null = null;
  selectedFileNamePerson: String | null = null;
  capturedFile: File | null = null;

  constructor(private http: HttpClient) {}

  // Chức năng nhận diện khuôn mặt từ camera
  captureImage(imageUrl: string) {
    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera.jpg", { type: "image/jpeg" });
        this.capturedFile = file;
  
        // Sau khi đã có file, gọi submitImage
        this.submitImage();
      })
      .catch(err => {
        console.error("Lỗi capture ảnh từ camera:", err);
      });
  }
  

  // Chọn ảnh từ máy tính
  onFilesSelected(event: any) {
    this.selectedFiles = event.target.files;
    this.selectedFileName = Array.from(this.selectedFiles).map((selectedFiles: any) => selectedFiles.name).join(', ');
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
    this.filesForNewPerson = event.target.files;
    this.selectedFileNamePerson = Array.from(this.filesForNewPerson).map((filesForNewPerson: any) => filesForNewPerson.name).join(', ');

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
