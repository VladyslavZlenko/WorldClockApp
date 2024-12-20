import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {TimeService} from '../../services/time.service';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-add-timezone-dialog',
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './add-timezone-dialog.component.html'
})
export class AddTimezoneDialogComponent implements OnInit {
  timezones: string[] = [];
  selectedTimezone: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<AddTimezoneDialogComponent>,
    private timeService: TimeService
  ) {
  }

  ngOnInit(): void {
    this.timeService.getAllTimezones().subscribe((data: string[]): void => {
      this.timezones = data;
    });
  }

  onAdd() {
    if (this.selectedTimezone) {
      this.dialogRef.close(this.selectedTimezone);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
