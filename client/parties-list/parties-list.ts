/// <reference path="../../typings/angular2-meteor/angular2-meteor.d.ts" />
/// <reference path="../../typings/ng2-meteor-accounts/ng2-meteor-accounts.d.ts" />
/// <reference path="../../typings/angular2/angular2.d.ts" />
/// <reference path="../../typings/angular2/router.d.ts" />
/// <reference path="../../typings/angular2/core.d.ts" />
/// <reference path="../../typings/Counts/Counts.d.ts" />
/// <reference path="../../packages/socially-browser/client/login/login.ts" />
/// <reference path="../../packages/socially-mobile/client/login/login-page.ts" />

import {Component, View} from 'angular2/core';

import {Parties} from 'collections/parties';

import {PartiesForm} from 'client/parties-form/parties-form';

import {RouterLink} from 'angular2/router';

import {AccountsUI} from 'meteor-accounts-ui';

import {InjectUser} from 'meteor-accounts';

import {MeteorComponent} from 'angular2-meteor';

import {PaginationService, PaginatePipe, PaginationControlsCpm} from 'ng2-pagination';

import {RsvpPipe} from 'client/lib/pipes';

import {ANGULAR2_GOOGLE_MAPS_DIRECTIVES} from 'ng2-google-maps/core';

import {Login} from 'socially';

@Component({
    selector: 'parties-list',
    viewProviders: [PaginationService]
})
@View({
    templateUrl: '/client/parties-list/parties-list.html',
    directives: [ANGULAR2_GOOGLE_MAPS_DIRECTIVES, PartiesForm, RouterLink, Login, PaginationControlsCpm],
    pipes: [PaginatePipe, RsvpPipe]
})
@InjectUser()
export class PartiesList extends MeteorComponent {
    parties: Mongo.Cursor<Party>;
    pageSize: number = 10;
    curPage: ReactiveVar<number> = new ReactiveVar<number>(1);
    nameOrder: ReactiveVar<number> = new ReactiveVar<number>(1);
    partiesSize: number = 0;
    location: ReactiveVar<string> = new ReactiveVar<string>(null);
    user: Meteor.User;

    constructor() {
        super();
        this.autorun(() => {
            let options = {
                limit: this.pageSize,
                skip: (this.curPage.get() - 1) * this.pageSize,
                sort: { name: this.nameOrder.get() }
            };
            this.subscribe('parties', options, this.location.get(), () => {
                this.parties = Parties.find({}, { sort: { name: this.nameOrder.get() } });
            }, true);
        });

        this.autorun(() => {
            this.partiesSize = Counts.get('numberOfParties');
        }, true);
    }

    removeParty(party) {
        Parties.remove(party._id);
    }

    search(value: string) {
        this.curPage.set(1);
        this.location.set(value);
    }

    onPageChanged(page: number) {
        this.curPage.set(page);
    }

    changeSortOrder(nameOrder: string) {
        this.nameOrder.set(parseInt(nameOrder));
    }

    isOwner(party: Party): boolean {
        if (this.user) {
            return this.user._id === party.owner;
        }

        return false;
    }
}
