import { Pipe, PipeTransform } from '@angular/core';
import { UsernameService } from '../services/database/username.service';
import { Observable } from 'rxjs';

@Pipe({
  name: 'uidToUsername',
  standalone: true
})
export class UidToUsernamePipe implements PipeTransform {

  constructor(private usernameService: UsernameService){}

  transform(uid: string): Observable<string> {
    return this.usernameService.getUsername(uid);
  }

}
