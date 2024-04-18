import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Member, PlanData, PlanService, Role } from 'src/app/services/database/plan.service';
import { ModalController } from '@ionic/angular/standalone';
import { PlanDetailModalComponent } from '../plan-detail-modal/plan-detail-modal.component';
import { PlanCreateModalComponent } from '../plan-create-modal/plan-create-modal.component';
import { UsernameService } from 'src/app/services/database/username.service';

@Component({
  selector: 'app-plan-card',
  templateUrl: './plan-card.component.html',
  styleUrls: ['./plan-card.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class PlanCardComponent implements OnInit {
  readonly Content = Content;
  plans: { id: string, data: PlanData }[] = [];
  planInvites: { id: string, data: PlanData }[] = [];
  modal: HTMLIonModalElement | null = null;
  shownContent: Content = Content.List;

  constructor(private modalCtrl: ModalController, private planService: PlanService, private authService: AuthenticationService, private usernameService: UsernameService) {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.getPlans();
      }
    })
  }

  ngOnInit() {
    let test = 0;
  }

  getPlans() {
    this.plans = [];
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.getUserPlans(uid).subscribe(
      (planIDs) => {
        planIDs.forEach(id => {
          this.planService.getPlanData(uid, id).subscribe(
            (data) => {
              this.plans.push({ id, data })
            }
          );
        });
      }
    );
  }

  getPlanInvites() {
    this.planInvites = [];
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.getPlanInvites(uid).subscribe(
      (planIDs) => {
        planIDs.forEach(id => {
          this.planService.getPlanData(uid, id).subscribe(
            (data) => {
              this.plans.push({ id, data })
            }
          );
        });
      }
    );
  }

  declinePlanInvite(planID: string) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.rejectPlanInvite(uid, planID).subscribe(
      () => {
        this.getPlanInvites();
      }
    );
  }

  getRole(planData: PlanData): Role {
    const uid = this.authService.currentUser.value?.uid as string;
    const members = planData.members as Member[];
    const memberIndex = members.findIndex(member => member.uid === uid);
    return members[memberIndex].role as Role;
  }

  acceptPlanInvite(planID: string) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.acceptPlanInvite(uid, planID).subscribe(
      () => {
        this.getPlanInvites();
      }
    );
  }

  async openCreatePlanModal() {
    this.modal = await this.modalCtrl.create({
      component: PlanCreateModalComponent,
      initialBreakpoint: .5,
      breakpoints: [0, .5],
    });

    await this.modal.present();

    await this.modal.onWillDismiss().then(({ data, role }) => {
      if (role === 'created') {
        this.getPlans();
      }
    });
  }

  async openPlanModal(planData: { id: string, data: PlanData }) {
    this.modal = await this.modalCtrl.create({
      component: PlanDetailModalComponent,
      componentProps: {
        plan: planData,
      },
      initialBreakpoint: .5,
      breakpoints: [0, .5],
    });

    await this.modal.present();

    await this.modal.onWillDismiss().then(({ data, role }) => {
      if (role === 'deleted') {
        this.getPlans();
      }
    });
  }

  changeContent(content: Content) {
    this.shownContent = content;
    if (this.shownContent === Content.Invites) {
      this.getPlanInvites();
    } else if (this.shownContent === Content.List) {
      this.getPlans();
    }
  }

}

export enum Content {
  List = "planList",
  Invites = "invites"
}
