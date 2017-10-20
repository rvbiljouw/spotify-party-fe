import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'duration'})
export class DurationPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    return this.toHHMMSS(value);
  }

  private toHHMMSS(secs: number) {
    let date = new Date(1970, 1, 1, 0);
    date.setMilliseconds(secs);
    return date.toTimeString().slice(3, 8);
  }
}
