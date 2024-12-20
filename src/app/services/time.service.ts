import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, interval, Observable, of, tap} from 'rxjs';

const SAVED_TIMEZONES_STORAGE_KEY = 'savedTimezones';

export interface TimezoneData {
  abbreviation: string;
  client_ip: string;
  datetime: string;
  day_of_week: number;
  day_of_year: number;
  dst: boolean;
  dst_from: string | null;
  dst_until: string | null;
  dst_offset: number;
  raw_offset: number;
  timezone: string;
  unixtime: number;
  utc_datetime: string;
  utc_offset: string;
  week_number: number;
}

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  private apiBase = 'https://worldtimeapi.org/api';

  private timezonesList: string[] | [] = [];

  private savedTimezones$: BehaviorSubject<TimezoneData[]> = new BehaviorSubject<TimezoneData[]>([]);
  private UTCTime$: BehaviorSubject<Date> = new BehaviorSubject<Date>(new Date());

  constructor(private http: HttpClient) {
    const localStorageTimezones: string | null = localStorage.getItem(SAVED_TIMEZONES_STORAGE_KEY);
    if (localStorageTimezones) {
      this.savedTimezones$.next(JSON.parse(localStorageTimezones));
    }

    interval(1000).subscribe((): void => {
      const time = this.UTCTime$.value;
      time.setMilliseconds(time.getMilliseconds() + 1000)
      this.UTCTime$.next(time);
    })

    this.getIPTime().subscribe((data: TimezoneData): void => {
      this.UTCTime$.next(new Date(data.utc_datetime));
      if (!localStorageTimezones) {
        this.savedTimezones$.next([data]);
        localStorage.setItem(SAVED_TIMEZONES_STORAGE_KEY, JSON.stringify([data]));
      }
    });
  }

  getUTCTime(): BehaviorSubject<Date> {
    return this.UTCTime$;
  }

  getIPTime(): Observable<TimezoneData> {
    return this.http.get<TimezoneData>(`${this.apiBase}/ip`);
  }

  getAllTimezones(): Observable<string[]> {
    if (this.timezonesList.length > 0) {
      return of(this.timezonesList);
    }
    return this.http.get<string[]>(`${this.apiBase}/timezone`)
      .pipe(tap(data => this.timezonesList = data))
  }

  getTimezoneData(timezone: string): Observable<TimezoneData> {
    return this.http.get<TimezoneData>(`${this.apiBase}/timezone/${encodeURIComponent(timezone)}`);
  }

  getSavedTimezones(): Observable<TimezoneData[]> {
    return this.savedTimezones$;
  }

  addTimezone(timezone: string): void {
    if (!this.savedTimezones$.value.findIndex((t: TimezoneData) => t.abbreviation === timezone)) {
      this.getTimezoneData(timezone).subscribe((data: TimezoneData) => {
          const newTimezones: TimezoneData[] = [...this.savedTimezones$.value, data];
          localStorage.setItem(SAVED_TIMEZONES_STORAGE_KEY, JSON.stringify(newTimezones));
          this.savedTimezones$.next(newTimezones)
        }
      );
    }
  }
}
