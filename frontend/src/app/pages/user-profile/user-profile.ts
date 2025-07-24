import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { User } from '../../models/property.model';
import { Booking } from '../../models/property.model';
import { ApiService } from '../../services/api.service';

// Interface to match the structure in bookings.json
interface BookingData {
  id: string;
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  bookingRef: string;
  address: string;
  city: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfileComponent implements OnInit {
  user: User | undefined;
  bookings: Booking[] | undefined;
  activeTab: 'profile' | 'bookings' | 'settings' = 'profile';
  
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}
  
  ngOnInit(): void {
    // Check for tab query parameter
    this.route.queryParams.subscribe(params => {
      if (params['tab'] && (params['tab'] === 'profile' || params['tab'] === 'bookings' || params['tab'] === 'settings')) {
        this.activeTab = params['tab'] as 'profile' | 'bookings' | 'settings';
      }
      
      // Check for booking reference to auto-select a booking
      if (params['ref']) {
        this.activeTab = 'bookings';
      }
    });
    
    // Load user data from API
    this.apiService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        // Fallback to local data if API fails
        import('../../data/user.json').then(data => {
          this.user = data.default;
        });
      }
    });
    
    // Load bookings data from API
    this.apiService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
      },
      error: (error) => {
        console.error('Error fetching bookings:', error);
        // Fallback to local data if API fails
        import('../../data/bookings.json').then(data => {
          // Map the booking data to match the Booking interface
          this.bookings = (data.default as BookingData[]).map(booking => ({
            ...booking,
            bookingReference: booking.bookingRef // Map bookingRef to bookingReference
          }));
        });
      }
    });
  }
  
  setActiveTab(tab: 'profile' | 'bookings' | 'settings'): void {
    this.activeTab = tab;
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  calculateNights(checkIn: string, checkOut: string): number {
    if (!checkIn || !checkOut) return 0;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  getBookingStatus(checkIn: string, checkOut: string): 'upcoming' | 'active' | 'completed' {
    if (!checkIn || !checkOut) return 'upcoming';
    
    const now = new Date();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (now < checkInDate) {
      return 'upcoming';
    } else if (now >= checkInDate && now <= checkOutDate) {
      return 'active';
    } else {
      return 'completed';
    }
  }
  
  getStatusBadgeClass(status: 'upcoming' | 'active' | 'completed'): string {
    switch (status) {
      case 'upcoming':
        return 'bg-primary';
      case 'active':
        return 'bg-success';
      case 'completed':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }
}