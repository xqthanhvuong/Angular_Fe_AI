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
  constructor(private http: HttpClient) {}

  // Chức năng nhận diện khuôn mặt từ camera
  captureImage(imageUrl: string) {
    this.http
      .post('http://localhost:5000/identify', { image: imageUrl })
      .subscribe((response: any) => {
        this.personName = response.person;
        console.log('Nhận diện người:', this.personName);
      });
  }

  // Chọn ảnh từ máy tính
  onFilesSelected(event: any) {
    this.selectedFiles = event.target.files;
    this.selectedFileName = Array.from(this.selectedFiles).map((selectedFiles: any) => selectedFiles.name).join(', ');
  }

  // Gửi ảnh đã chọn lên backend để nhận diện
  submitImage() {
    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      for (let file of this.selectedFiles) {
        formData.append('image', file, file.name);
      }

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
      console.log('Vui lòng chọn ảnh trước khi gửi!');
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
