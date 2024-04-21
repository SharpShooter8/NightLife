import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Member, PlanData, PlanService, Role, rolePrecedence } from 'src/app/services/database/plan.service';
import { UidToUsernamePipe } from "../../../pipes/uid-to-username.pipe";
import { Observable, concat } from 'rxjs';
import { IonLabel, IonDatetimeButton, IonModal, IonDatetime, IonItem, IonIcon, IonItemSliding, IonList, IonChip, IonAvatar, IonItemOptions, IonItemOption, IonAccordionGroup, IonAccordion, IonSelect, IonSelectOption, IonInput } from "@ionic/angular/standalone";

@Component({
  selector: 'app-mapbox-edit-plan',
  templateUrl: './mapbox-edit-plan.component.html',
  styleUrls: ['./mapbox-edit-plan.component.scss'],
  standalone: true,
  imports: [IonInput, IonSelect, IonSelectOption, IonAccordion, IonAccordionGroup, IonItemOption, IonItemOptions, IonAvatar, IonChip, IonList, IonItemSliding, IonIcon, IonItem, IonDatetime, IonModal, IonDatetimeButton, IonLabel, CommonModule, UidToUsernamePipe]
})
export class MapboxEditPlanComponent implements OnInit {
  readonly Role = Role;
  @Input() plan!: { id: string, data: PlanData };
  @Output() invitePressed: EventEmitter<{ id: string, data: PlanData }> = new EventEmitter<{ id: string, data: PlanData }>();
  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();
  @Output() confirmedEdit: EventEmitter<void> = new EventEmitter<void>();

  planNameInput: string | undefined;
  planStartDateInput: string | undefined;
  planEndDateInput: string | undefined;
  planUpdate: { name?: string, startDate?: string, endDate?: string } = {};
  memberUpdate: { memberUID: string, newRole: Role, remove?: boolean }[] = [];
  locationUpdate: { locationID: string, startDate?: string, endDate?: string, order?: number, remove?: boolean }[] = [];

  timeButtonFormat = {
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

  constructor(private authService: AuthenticationService, private planService: PlanService) { }

  ngOnInit() {
    let test = 0;
  }

  getUserRole(): Role {
    const uid = this.authService.currentUser.value?.uid as string;
    return this.plan.data.members.find(member => member.uid === uid)?.role as Role;
  }

  hasPermission(requireRole: Role): boolean {
    return rolePrecedence[this.getUserRole()] <= rolePrecedence[requireRole];
  }

  canPromote(memberRole: Role): boolean {
    return rolePrecedence[this.getUserRole()] < (rolePrecedence[memberRole] - 1) &&
      this.planService.getPromotedRole(memberRole) !== memberRole;
  }

  canDemote(memberRole: Role): boolean {
    return rolePrecedence[this.getUserRole()] < (rolePrecedence[memberRole]) &&
      this.planService.getDemotedRole(memberRole) !== memberRole;
  }

  canRemove(memberRole: Role): boolean {
    return rolePrecedence[this.getUserRole()] <= 2 &&
      rolePrecedence[this.getUserRole()] < rolePrecedence[memberRole];
  }

  getOrderOptions(): string[] {
    return Array.from({ length: this.plan.data.locations.length }, (_, i) => (i + 1).toString());
  }

  updatePlanNameInput($event: any) {
    this.planUpdate.name = $event as string;
    //this.plan.data.name = this.planUpdate.name;
  }

  updatePlanStartDateInput($event: any) {
    this.planUpdate.startDate = $event as string;
    this.plan.data.startDate = this.planUpdate.startDate;
  }

  updatePlanEndDateInput($event: any) {
    this.planUpdate.endDate = $event as string;
    this.plan.data.endDate = this.planUpdate.endDate;
  }

  updatePlanLocationStartDate(locationID: string, newStartDate: any) {
    let index = this.locationUpdate.findIndex(item => item.locationID === locationID);
    if (index === -1) {
      index = this.locationUpdate.push({ locationID: locationID, startDate: newStartDate }) - 1;
    } else {
      this.locationUpdate[index].startDate = newStartDate;
    }
    const locationIndex = this.plan.data.locations.findIndex(location => location.locationID === locationID);
    this.plan.data.locations[locationIndex].startDate = this.locationUpdate[index].startDate as string;
  }

  updatePlanLocationEndDate(locationID: string, newEndDate: any) {
    let index = this.locationUpdate.findIndex(item => item.locationID === locationID);
    if (index === -1) {
      index = this.locationUpdate.push({ locationID: locationID, endDate: newEndDate as string }) - 1;
    } else {
      this.locationUpdate[index].endDate = newEndDate as string;
    }
    const locationIndex = this.plan.data.locations.findIndex(location => location.locationID === locationID);
    this.plan.data.locations[locationIndex].endDate = this.locationUpdate[index].endDate as string;
  }

  updatePlanLocationOrder(locationID: string, newOrder: any) {
    let index = this.locationUpdate.findIndex(item => item.locationID === locationID);
    if (index === -1) {
      index = this.locationUpdate.push({ locationID, order: (newOrder as number) }) - 1;
    } else {
      this.locationUpdate[index] = { ... this.locationUpdate[index], order: newOrder };
    }
    const locationIndex = this.plan.data.locations.findIndex(location => location.locationID === locationID);
    const locationToMove = this.plan.data.locations.splice(locationIndex, 1)[0];
    this.plan.data.locations.splice(newOrder - 1, 0, locationToMove);
    this.plan.data.locations.map((location, index) => ({ ...location, orderNum: index + 1 }));
  }

  removeLocation(locationID: string) {
    let index = this.locationUpdate.findIndex(item => item.locationID === locationID);
    if (index === -1) {
      index = this.locationUpdate.push({ locationID: locationID, remove: true }) - 1;
    } else {
      this.locationUpdate[index].remove = true;
    }
    const locationIndex = this.plan.data.locations.findIndex(location => location.locationID === locationID);
    this.plan.data.locations.splice(locationIndex, 1);
  }

  removeMember(member: Member) {
    let index = this.memberUpdate.findIndex(searchMember => searchMember.memberUID === member.uid);
    if (index === -1) {
      index = this.memberUpdate.push({ memberUID: member.uid, newRole: member.role, remove: true }) - 1;
    } else {
      this.memberUpdate[index].remove = true;
    }
    const memberIndex = this.plan.data.members.findIndex(searchMember => searchMember.uid === member.uid);
    this.plan.data.members.splice(memberIndex, 1);
  }

  promoteMember(member: Member) {
    const promotedRole = this.planService.getPromotedRole(member.role);
    if (member.role === promotedRole) {
      return;
    }
    let index = this.memberUpdate.findIndex(searchMember => searchMember.memberUID === member.uid);
    if (index === -1) {
      index = this.memberUpdate.push({ memberUID: member.uid, newRole: promotedRole }) - 1;
    } else {
      if (this.memberUpdate[index].newRole === null) {
        return;
      }
      this.memberUpdate[index].newRole = promotedRole;
    }
    const memberIndex = this.plan.data.members.findIndex(searchMember => searchMember.uid === member.uid);
    this.plan.data.members[memberIndex].role = promotedRole;
  }

  demoteMember(member: Member) {
    const demotedRole = this.planService.getDemotedRole(member.role);
    if (member.role === demotedRole) {
      return;
    }
    let index = this.memberUpdate.findIndex(mem => mem.memberUID === member.uid);
    if (index === -1) {
      index = this.memberUpdate.push({ memberUID: member.uid, newRole: demotedRole }) - 1;
    } else {
      if (this.memberUpdate[index].newRole === null) {
        return;
      }
      this.memberUpdate[index].newRole = demotedRole;
    }
    const memberIndex = this.plan.data.members.findIndex(searchMember => searchMember.uid === member.uid);
    this.plan.data.members[memberIndex].role = demotedRole;
  }

  confirmEdits() {
    const uid = this.authService.currentUser.value?.uid as string;
    let updateObservables: Observable<void>[] = [];

    if (Object.keys(this.planUpdate).length > 0) {
      if (this.planUpdate.name) {
        updateObservables.push(this.planService.updateName(uid, this.plan.id, this.planUpdate.name));
      }
      if (this.planUpdate.startDate) {
        updateObservables.push(this.planService.updateStartDate(uid, this.plan.id, this.planUpdate.startDate));
      }
      if (this.planUpdate.endDate) {
        updateObservables.push(this.planService.updateEndDate(uid, this.plan.id, this.planUpdate.endDate));
      }
    }

    if (this.memberUpdate.length > 0) {
      this.memberUpdate.forEach(update => {
        if (update.remove) {
          updateObservables.push(this.planService.removeMember(uid, this.plan.id, update.memberUID));
        } else {
          updateObservables.push(this.planService.updateMemberRole(uid, this.plan.id, update.memberUID, update.newRole));
        }
      });
    }

    if (this.locationUpdate.length > 0) {
      this.locationUpdate.forEach(update => {
        if (update.remove) {
          updateObservables.push(this.planService.removeLocation(uid, this.plan.id, update.locationID));
        } else {
          if (update.order) {
            updateObservables.push(this.planService.changeLocationOrder(uid, this.plan.id, update.locationID, update.order));
          }
          if (update.startDate) {
            updateObservables.push(this.planService.updateLocationStartDate(uid, this.plan.id, update.locationID, update.startDate));
          }
          if (update.endDate) {
            updateObservables.push(this.planService.updateLocationEndDate(uid, this.plan.id, update.locationID, update.endDate));
          }
        }
      });
    }
    concat(...updateObservables).subscribe(() => {
      this.confirmedEdit.emit();
    });
  }
}
