import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular'
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { PlanData, PlanService } from 'src/app/services/database/plan.service';

@Component({
  selector: 'app-mapbox-plan-invites-select',
  templateUrl: './mapbox-plan-invites-select.component.html',
  styleUrls: ['./mapbox-plan-invites-select.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapboxPlanInvitesSelectComponent implements OnInit {

  @Output() planPressed: EventEmitter<{ id: string, data: PlanData }> = new EventEmitter<{ id: string, data: PlanData }>();
  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();

  planInvites$: Observable<{ id: string, data: PlanData }[]>;

  constructor(private authService: AuthenticationService, private planService: PlanService) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.planInvites$ = this.planService.getPlanInvites(uid);
  }

  ngOnInit() {
    let test = 0;
  }

  getDaysUntil(targetDate: string): number {
    const targetDateTime = new Date(targetDate);
    if (isNaN(targetDateTime.getTime())) {
      return -1;
    }
    const currentDate = new Date();
    const differenceMs = targetDateTime.getTime() - currentDate.getTime();
    const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    return Math.round(differenceDays);
  }

  acceptPlanInvite(planInvite: { id: string, data: PlanData }){
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.acceptPlanInvite(uid, planInvite.id).subscribe();
  }

  declinePlanInvite(planInvite: { id: string, data: PlanData }){
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.rejectPlanInvite(uid, planInvite.id).subscribe();
  }

}
