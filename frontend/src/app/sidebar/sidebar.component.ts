import { Component, OnInit } from '@angular/core';


export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '/admin/dashboard',     title: 'Welcome',         icon:'nc-bank',       class: '' },
    { path: '/admin/maps',          title: 'Visualisation',         icon:'nc-vector',  class: '' },
    { path: '/admin/notifications', title: 'New File',     icon:'nc-album-2',    class: '' },
    { path: '/admin/user',          title: 'User Profile',      icon:'nc-single-02',  class: '' },
    { path: '/admin/table',         title: 'Visualisation history',       icon:'nc-single-copy-04', class: ''},
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
}
