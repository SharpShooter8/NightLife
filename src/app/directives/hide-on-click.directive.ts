import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHideOnClick]',
  standalone: true
})
export class HideOnClickDirective {

  constructor(private elementRef: ElementRef) { }

  @HostListener('click')
  onClick() {
    this.elementRef.nativeElement.style.display = "none";
  }
}
