import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TimeService, TimezoneData} from '../../services/time.service';
import {BehaviorSubject, interval, Observable, Subject, switchMap, takeUntil} from 'rxjs';
import {AddTimezoneDialogComponent} from '../add-timezone-dialog/add-timezone-dialog.component';
import {CommonModule} from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-world-clock-table',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatButtonToggleModule,
  ],
  templateUrl: './world-clock-table.component.html',
  styleUrls: ['./world-clock-table.component.scss'],
})

export class WorldClockTableComponent implements OnInit, OnDestroy, AfterViewInit {

  dataSource = new MatTableDataSource<TimezoneData>([]);
  displayedColumns: string[] = [
    'timezone',
    'abbrevOffset',
    'localTime',
    'localDate',
    'dstInfo'
  ];
  updateTimeIntervals = [
    {label: '1 second', value: 1000},
    {label: '5 seconds', value: 5000},
    {label: '10 seconds', value: 10000},
    {label: '30 seconds', value: 30000},
    {label: '1 minute', value: 60000},
  ];
  selectedUpdateTimeInterval = 1000;
  utcTime: string = new Date().toISOString();

  private updateTimeInterval$ = new BehaviorSubject<number>(this.selectedUpdateTimeInterval);
  private componentDestroyed$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private timeService: TimeService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.timeService.getSavedTimezones()
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((data: TimezoneData[]): void => {
        this.dataSource.data = data;
      });

    this.updateTimeInterval$.pipe(
      switchMap((duration: number): Observable<number> => interval(duration)),
      takeUntil(this.componentDestroyed$)
    ).subscribe(() => {
      this.utcTime = this.timeService.getUTCTime().value.toISOString();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onIntervalChange(): void {
    this.updateTimeInterval$.next(this.selectedUpdateTimeInterval);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTimezoneDialogComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe((result: string) => {
      this.timeService.addTimezone(result)
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
