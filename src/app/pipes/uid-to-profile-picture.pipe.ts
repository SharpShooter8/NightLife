import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uidToProfilePicture'
})
export class UidToProfilePicturePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
