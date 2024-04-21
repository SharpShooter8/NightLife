import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular'
import { PlanData, PlanService, Role } from 'src/app/services/database/plan.service';
import { FoursquareService, Photo, Place } from 'src/app/services/foursquare/foursquare.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { UidToUsernamePipe } from 'src/app/pipes/uid-to-username.pipe';
import { FsqidToPlacePipe } from 'src/app/pipes/fsqid-to-place.pipe';
import { IdToCustomLocationPipe } from 'src/app/pipes/id-to-custom-location.pipe';
import { CommonModule } from '@angular/common';
import { CustomLocationData } from 'src/app/services/database/custom-location.service';
import { SwiperContainer } from 'swiper/element';

@Component({
  selector: 'app-mapbox-plan-details',
  templateUrl: './mapbox-plan-details.component.html',
  styleUrls: ['./mapbox-plan-details.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, UidToUsernamePipe, FsqidToPlacePipe, IdToCustomLocationPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapboxPlanDetailsComponent implements OnInit, AfterViewInit {

  @Input() plan!: { id: string, data: PlanData };
  @Output() placeLocation: EventEmitter<Place> = new EventEmitter<Place>();
  @Output() customLocation: EventEmitter<CustomLocationData> = new EventEmitter<CustomLocationData>();
  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('swiper') swiper!: ElementRef<SwiperContainer>;

  highlightedDates: { date: string, textColor: string, backgroundColor: string }[] = [];
  dateTimeButtonsFormat = {
    date: {
      weekday: 'short',
      month: 'long',
      day: '2-digit',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  constructor(private popoverController: PopoverController, private foursquareService: FoursquareService, private authService: AuthenticationService, private planService: PlanService) { }

  ngOnInit() {
    let test = 0;
  }

  ngAfterViewInit(): void {
    this.swiper.nativeElement.swiper.allowTouchMove = false;
  }

  emitPlaceLocation(placeID: string) {
    this.foursquareService.placeDetails(placeID, { fields: "distance,hours,rating,location,photos,name,price,tips,website,fsq_id,geocodes" }).subscribe(
      (place) => {
        this.placeLocation.emit(place);
      }
    );
  }

  swiperNextSlide() {
    this.swiper.nativeElement.swiper.slideNext();
  }

  swiperPreviousSlide() {
    this.swiper.nativeElement.swiper.slidePrev();
  }

  getUserRole(plandata: PlanData): Role {
    const uid = this.authService.currentUser.value?.uid as string;
    const role = plandata.members.find(member => member.uid === uid)?.role;
    return role ? role : Role.Invited;
  }

  isAttending(uids: string[]): boolean {
    const uid = this.authService.currentUser.value?.uid as string;
    return uids.includes(uid);
  }

  confirmAttendence(planID: string, locationID: string) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.addLocationAttendee(uid, planID, locationID).subscribe();
  }

  cancelAttendence(planID: string, locationID: string) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.removeLocationAttendee(uid, planID, locationID).subscribe();
  }

  timestampToDisplayTime(dateString: string): string {
    const date = new Date(dateString);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayOfWeek = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];
    const dayOfMonth = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const timeString = `${formattedHours}:${minutes < 10 ? "0" : ""}${minutes} ${ampm}`;
    const dateStringFormatted = `${dayOfWeek}, ${month} ${dayOfMonth} at ${timeString}`;
    return dateStringFormatted;
  }
}
