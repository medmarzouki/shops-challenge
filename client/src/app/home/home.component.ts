﻿import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

import { Shop, Location } from '../_models/index';
import { AlertService, ShopService } from '../_services/index';

@Component({
    moduleId: module.id.toString(),
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    shops: Shop[] = [];
    loading = false;
    page = 1;
    hasNextPage = false;
    location: Location;

    constructor(
        private router: Router,
        private shopService: ShopService,
        private alertService: AlertService) { }

    ngOnInit() {
        // get user location then load nearby shops
        this.initLocation();
    }

    private initLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    //load shops with user Location
                    this.location = new Location();
                    this.location.latitude = position.coords.latitude;
                    this.location.longitude = position.coords.longitude;
                    this.loadShopsNearby();
                },
                error => {
                    //load shops without user Location
                    this.loadShopsNearby();
                });
        } else {
            this.alertService.error("Geolocation is not supported by this browser.");
        }
    }

    private loadShopsNearby() {
        this.loading = true;
        this.shopService.getNearby(this.page, this.location)
            .subscribe(res => {
                res['hydra:member'].forEach(member => {
                    let shop = new Shop();
                    shop.id = member.shop.id;
                    shop.picture = member.shop.picture;
                    shop.name = member.shop.name;
                    shop.email = member.shop.email;
                    shop.city = member.shop.city;
                    shop.latitude = member.shop.latitude;
                    shop.longitude = member.shop.longitude;
                    shop.distance = this.round(member.distance, 2) + '';

                    this.shops.push(shop);
                });

                this.loading = false;

                //show "Load more" button if next page available
                if(res['hydra:view']['hydra:next'])
                    this.hasNextPage = true;
            },
            error => {
                this.router.navigate(['/login']);
            });
    }

    private loadMore() {
        this.page++;
        this.loadShopsNearby();
    }

    private round(number, precision) {
    	var factor = Math.pow(10, precision);
    	var tempNumber = number * factor;
    	var roundedTempNumber = Math.round(tempNumber);
    	return roundedTempNumber / factor;
    };
}
