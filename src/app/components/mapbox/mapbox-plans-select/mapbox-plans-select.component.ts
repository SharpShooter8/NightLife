import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { PlanData, PlanService, Role } from 'src/app/services/database/plan.service';
import { IonThumbnail, IonItem, IonLabel, IonIcon, IonList, IonItemSliding, IonImg, IonItemOptions, IonItemOption } from "@ionic/angular/standalone";

@Component({
  selector: 'app-mapbox-plans-select',
  templateUrl: './mapbox-plans-select.component.html',
  styleUrls: ['./mapbox-plans-select.component.scss'],
  standalone: true,
  imports: [IonThumbnail, IonItemOption, IonItemOptions, IonImg, IonItemSliding, IonList, IonIcon, IonLabel, IonItem, CommonModule],
})
export class MapboxPlansSelectComponent implements OnInit {

  @Output() planPressed: EventEmitter<{ id: string, data: PlanData }> = new EventEmitter<{ id: string, data: PlanData }>();
  @Output() editPressed: EventEmitter<{ id: string, data: PlanData }> = new EventEmitter<{ id: string, data: PlanData }>();
  @Output() createPressed: EventEmitter<void> = new EventEmitter<void>();
  @Output() invitesPressed: EventEmitter<void> = new EventEmitter<void>();

  plans$: Observable<{ id: string, data: PlanData }[]>;

  constructor(private authService: AuthenticationService, private planService: PlanService) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.plans$ = this.planService.getUserPlans(uid);
  }

  ngOnInit() {
    let test = 0;
  }

  isOwner(plan: PlanData): boolean {
    const uid = this.authService.currentUser.value?.uid as string;
    return plan.members.find(member => member.uid === uid)?.role as Role === Role.Owner;
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

  leavePlan(plan: { id: string, data: PlanData }) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.removeMember(uid, plan.id, uid).subscribe(
      () => {
        this.refreshPlans();
      }
    );
  }

  deletePlan(plan: { id: string, data: PlanData }) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.removePlan(uid, plan.id).subscribe(
      () => {
        this.refreshPlans();
      }
    );
  }

  refreshPlans() {
    const uid = this.authService.currentUser.value?.uid as string;
    this.plans$ = this.planService.getUserPlans(uid);
  }

}
