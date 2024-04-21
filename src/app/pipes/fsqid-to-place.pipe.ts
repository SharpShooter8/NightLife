import { Pipe, PipeTransform } from '@angular/core';
import { FoursquareService, Place } from '../services/foursquare/foursquare.service';
import { Observable } from 'rxjs';

@Pipe({
  name: 'fsqidToPlace',
  standalone: true
})
export class FsqidToPlacePipe implements PipeTransform {

  constructor(private foursquareService: FoursquareService){}

  transform(fsqid: string): Observable<Place> {
    return this.foursquareService.placeDetails(fsqid, {fields: "distance,hours,rating,location,photos,name,price,tips,website,fsq_id,geocodes"});
  }

}
