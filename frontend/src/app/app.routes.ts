import { Routes } from '@angular/router';
import { BookingConfirmComponent } from './pages/booking-confirm/booking-confirm';
import { UserProfileComponent } from './pages/user-profile/user-profile';
import { BookedPropertiesComponent } from './pages/booked-properties/booked-properties';
import { PageContainerComponent } from './components/page-container/page-container';

export const routes: Routes = [
    // Dynamic page routes using PageContainerComponent
    {path: '', component: PageContainerComponent, data: { pageId: 'home' }},
    {path: 'search', component: PageContainerComponent, data: { pageId: 'search-results' }},
    {path: 'property/:id', component: PageContainerComponent, data: { pageId: 'property-details' }},
    
    // Legacy routes - can be migrated to dynamic pages later
    {path: 'booking-confirm', component: BookingConfirmComponent},
    {path: 'profile', component: UserProfileComponent},
    {path: 'my-properties', component: BookedPropertiesComponent},
    
    // Redirect login and register to home since we're auto-logging in
    {path: 'login', redirectTo: '', pathMatch: 'full'},
    {path: 'register', redirectTo: '', pathMatch: 'full'},
];
