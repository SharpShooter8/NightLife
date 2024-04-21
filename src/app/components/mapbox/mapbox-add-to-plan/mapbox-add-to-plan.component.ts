import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, concat, tap } from 'rxjs';
import { HideOnClickDirective } from 'src/app/directives/hide-on-click.directive';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CustomLocationData } from 'src/app/services/database/custom-location.service';
import { Location, LocationType, PlanData, PlanService, Role, rolePrecedence } from 'src/app/services/database/plan.service';
import { Place } from 'src/app/services/foursquare/foursquare.service';
import { IonItem, IonCheckbox, IonList, IonLabel, IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-mapbox-add-to-plan',
  templateUrl: './mapbox-add-to-plan.component.html',
  styleUrls: ['./mapbox-add-to-plan.component.scss'],
  standalone: true,
  imports: [IonIcon, IonLabel, IonList, IonCheckbox, IonItem, CommonModule, HideOnClickDirective]
})
export class MapboxAddToPlanComponent implements OnInit {

  @Input() location!: Place | { id: string, data: CustomLocationData };

  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();
  @Output() confirmedAdd: EventEmitter<void> = new EventEmitter<void>();

  plans$: Observable<{ id: string, data: PlanData }[]>;
  selectedPlans: { plan: { id: string, data: PlanData }, checked: boolean }[] = [];
  showAddLocation: boolean = false;

  constructor(private authService: AuthenticationService, private planService: PlanService) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.plans$ = this.planService.getUserPlans(uid).pipe(
      tap((plans) => {
        plans.forEach((plan) => {
          this.selectedPlans.push({ plan, checked: false });
          return plans;
        })
        console.log(this.selectedPlans);
      })
    );
  }

  ngOnInit() {
    let test = 0;
  }

  getUserRole(plan: { id: string, data: PlanData }): Role {
    const uid = this.authService.currentUser.value?.uid as string;
    return plan.data.members.find(member => member.uid === uid)?.role as Role;
  }

  canAddToPlan(plan: { id: string, data: PlanData }): boolean {
    return rolePrecedence[this.getUserRole(plan)] <= rolePrecedence.planner;
  }

  handleCheckboxChange(plan: { id: string, data: PlanData }, checked: boolean) {
    const foundPlanIndex = this.selectedPlans.findIndex(planSelect => planSelect.plan.id === plan.id);
    if (foundPlanIndex > -1) {
      this.selectedPlans[foundPlanIndex].checked = checked;
    }
    this.showAddLocation = this.selectedPlans.filter(plan => plan.checked === true).length > 0;
  }

  isPlace(location: Place | { id: string, data: CustomLocationData }): location is Place {
    return 'fsq_id' in location;
  }

  isCustomLocation(location: Place | { id: string, data: CustomLocationData }): location is { id: string, data: CustomLocationData } {
    return 'owner' in location;
  }

  addLocationToPlans() {
    const uid = this.authService.currentUser.value?.uid as string;
    const checkedPlans = this.selectedPlans.filter(plan => plan.checked === true);
    if (checkedPlans.length < 1) {
      return;
    }
    const addLocationObservables: Observable<void>[] = [];
    checkedPlans.forEach(plan => {
      if (this.isPlace(this.location)) {
        const locationData: Location = {
          id: this.location.fsq_id,
          type: LocationType.Foursquare,
          name: this.location.name,
          lat: -9999,
          lng: -9999,
        }
        addLocationObservables.push(this.planService.addLocation(uid, plan.plan.id, this.planService.getFormattedTimestamp(), this.planService.getFormattedTimestamp(), locationData, -1));
      } else if (this.isCustomLocation(this.location)) {
        const locationData: Location = {
          id: this.location.id,
          type: LocationType.Custom,
          name: this.location.data.location.name,
          lat: -9999,
          lng: -9999,
        }
        addLocationObservables.push(this.planService.addLocation(uid, plan.plan.id, this.planService.getFormattedTimestamp(), this.planService.getFormattedTimestamp(), locationData, -1));
      }
    });
    concat(...addLocationObservables).subscribe(
      () => {
        this.confirmedAdd.emit();
      }
    )
  }
}
