import { Pipe, PipeTransform } from '@angular/core';
import { CustomLocationData, CustomLocationService } from '../services/database/custom-location.service';
import { Observable } from 'rxjs';

@Pipe({
  name: 'idToCustomLocation',
  standalone: true
})
export class IdToCustomLocationPipe implements PipeTransform {

  constructor(private customLocationService: CustomLocationService){}

  transform(id: string): Observable<CustomLocationData> {
    return this.customLocationService.getLocationData(id);
  }

}
