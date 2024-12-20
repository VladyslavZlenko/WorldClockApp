import {Component} from '@angular/core';
import {WorldClockTableComponent} from './components/world-clock-table/world-clock-table.component';

@Component({
  selector: 'app-root',
  imports: [WorldClockTableComponent],
  template: `<app-world-clock-table></app-world-clock-table>`
})
export class AppComponent {
  title = 'WorldClockApp';
}
