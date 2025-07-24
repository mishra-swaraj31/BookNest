import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { SearchResultsComponent } from './pages/search-results/search-results';
import { PropertyDetailsComponent } from './pages/property-details/property-details';
import { BookingConfirmComponent } from './pages/booking-confirm/booking-confirm';
import { UserProfileComponent } from './pages/user-profile/user-profile';
import { BookedPropertiesComponent } from './pages/booked-properties/booked-properties';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'search', component: SearchResultsComponent},
    {path: 'property/:id', component: PropertyDetailsComponent},
    {path: 'booking-confirm', component: BookingConfirmComponent},
    {path: 'profile', component: UserProfileComponent},
    {path: 'my-properties', component: BookedPropertiesComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
];
