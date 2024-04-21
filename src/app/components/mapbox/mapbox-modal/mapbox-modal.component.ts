import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, SegmentValue } from '@ionic/angular'
import { CommonModule } from '@angular/common';
import { MapboxPlanDetailsComponent } from '../mapbox-plan-details/mapbox-plan-details.component';
import { MapboxLocationDetailsComponent } from '../mapbox-location-details/mapbox-location-details.component';
import { MapboxCustomLocationDetailsComponent } from '../mapbox-custom-location-details/mapbox-custom-location-details.component';
import { MapboxDiscoverSelectComponent } from '../mapbox-discover-select/mapbox-discover-select.component';
import { MapboxPlansSelectComponent } from '../mapbox-plans-select/mapbox-plans-select.component';
import { MapboxCustomLocationsSelectComponent } from '../mapbox-custom-locations-select/mapbox-custom-locations-select.component';
import { MapboxPlanInvitesSelectComponent } from '../mapbox-plan-invites-select/mapbox-plan-invites-select.component';
import { MapboxCreatePlanComponent } from '../mapbox-create-plan/mapbox-create-plan.component';
import { MapboxEditPlanComponent } from '../mapbox-edit-plan/mapbox-edit-plan.component';
import { MapboxPlanInviteMemberComponent } from '../mapbox-plan-invite-member/mapbox-plan-invite-member.component';
import { MapboxCreateCustomLocationComponent } from '../mapbox-create-custom-location/mapbox-create-custom-location.component'
import { MapboxEditCustomLocationComponent } from '../mapbox-edit-custom-location/mapbox-edit-custom-location.component'
import { MapboxAddToPlanComponent } from '../mapbox-add-to-plan/mapbox-add-to-plan.component'

@Component({
  selector: 'app-mapbox-modal',
  templateUrl: './mapbox-modal.component.html',
  styleUrls: ['./mapbox-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, MapboxPlanDetailsComponent,
    MapboxLocationDetailsComponent, MapboxCustomLocationDetailsComponent,
    MapboxDiscoverSelectComponent, MapboxPlansSelectComponent,
    MapboxCustomLocationsSelectComponent, MapboxPlanInvitesSelectComponent,
    MapboxCreatePlanComponent, MapboxEditPlanComponent, MapboxPlanInviteMemberComponent,
    MapboxCreateCustomLocationComponent, MapboxEditCustomLocationComponent,
    MapboxAddToPlanComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapboxModalComponent implements OnInit {
  readonly Content = Content;
  content: Content.Manager = new Content.Manager();

  constructor(private modalController: ModalController) {
    this.content.setContent({ choice: Content.Choices.PlanSelect });
  }

  ngOnInit() {
    let test = 0;
  }

  updateContentFromSegment(value: SegmentValue | undefined) {
    if (value) {
      let choice = value as Content.Choices;
      switch (choice) {
        case (Content.Choices.DiscoverSelect):
          this.content.setContent({ choice: Content.Choices.DiscoverSelect });
          break;
        case (Content.Choices.PlanSelect):
          this.content.setContent({ choice: Content.Choices.PlanSelect })
          break;
        case (Content.Choices.CustomLocationSelect):
          this.content.setContent({ choice: Content.Choices.CustomLocationSelect })
          break;
      }
    }
  }
}

export namespace Content {
  export enum Choices {
    DiscoverSelect = "DiscoverSelect",
    AddToPlan = "AddToPlan",
    LocationDetail = "LocationDetail",
    PlanSelect = "PlanSelect",
    PlanInviteSelect = "PlanInviteSelect",
    PlanCreate = "PlanCreate",
    PlanEdit = "PlanEdit",
    PlanDetail = "PlanDetail",
    PlanInviteMember = "InviteMember",
    CustomLocationSelect = "CustomLocationSelect",
    CustomLocationCreate = "CustomLocationCreate",
    CustomLocationEdit = "CustomLocationEdit",
    CustomLocationDetail = "CustomLocationDetail",
  }

  export interface Content {
    choice: Choices;
    data?: any;
  }

  export class Manager {
    private contentList: Content[] = [];

    constructor() { }

    setContent(content: Content): void {
      this.contentList = [content];
    }

    pushContent(content: Content): void {
      this.contentList.push(content);
    }

    popContent(): Content | undefined {
      return this.contentList.pop();
    }

    switchContent(content: Content): void {
      this.contentList[this.contentList.length - 1] = content;
    }

    peekContentData(): any | undefined {
      const lastIndex = this.contentList.length - 1;
      return lastIndex >= 0 ? this.contentList[lastIndex].data : undefined;
    }

    peekContentChoice(): Choices | undefined {
      const lastIndex = this.contentList.length - 1;
      return lastIndex >= 0 ? this.contentList[lastIndex].choice : undefined;
    }

    isEmpty(): boolean {
      return this.contentList.length === 0;
    }

    clear(): void {
      this.contentList = [];
    }
  }
}



