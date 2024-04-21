import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CustomLocationData, CustomLocationService } from 'src/app/services/database/custom-location.service';

@Component({
  selector: 'app-mapbox-custom-location-details',
  templateUrl: './mapbox-custom-location-details.component.html',
  styleUrls: ['./mapbox-custom-location-details.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapboxCustomLocationDetailsComponent implements OnInit {

  @Input() customLocation!: { id: string, data: CustomLocationData };
  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();

  constructor(private customLocationService: CustomLocationService) { }

  ngOnInit() {
    let test = 0;
  }

  getFirstDayOfMonth(dateString: string): string {
    const [year, month] = dateString.split('-').map(Number);
    return this.formatDate(new Date(year, month - 1, 1));
  }

  getLastDayOfMonth(dateString: string): string {
    const [year, month] = dateString.split('-').map(Number);
    return this.formatDate(new Date(year, month, 0));
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
