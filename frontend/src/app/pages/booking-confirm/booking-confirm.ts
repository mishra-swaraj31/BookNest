import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
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
  selector: 'app-booking-confirm',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule],
  templateUrl: './booking-confirm.html',
  styleUrl: './booking-confirm.css'
})
export class BookingConfirmComponent implements OnInit {
  booking?: Booking;
  isLoading = true;
  error = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}
  
  ngOnInit(): void {
    // Get the booking reference from the URL query params
    this.route.queryParams.subscribe(params => {
      const bookingRef = params['ref'];
      
      if (bookingRef) {
        this.isLoading = true;
        
        // Fetch the booking from the API
        this.apiService.getBookingByReference(bookingRef).subscribe({
          next: (booking) => {
            this.booking = booking;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching booking:', error);
            
            // Fallback to local data if API fails
            import('../../data/bookings.json').then(data => {
              // Map the booking data to match the Booking interface
              const mappedBookings = (data.default as BookingData[]).map(booking => ({
                ...booking,
                bookingReference: booking.bookingRef // Map bookingRef to bookingReference
              }));
              
              this.booking = mappedBookings.find(b => b.bookingReference === bookingRef);
              
              // If we can't find the booking, use the first one as a fallback
              if (!this.booking && mappedBookings.length > 0) {
                this.booking = mappedBookings[0];
              }
              
              this.isLoading = false;
              this.error = !this.booking;
            });
          }
        });
      } else {
        this.isLoading = false;
        this.error = true;
      }
    });
  }
  
  viewAllBookings(): void {
    this.router.navigate(['/profile'], { queryParams: { tab: 'bookings' } });
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  calculateNights(): number {
    if (!this.booking) return 0;
    
    const checkIn = new Date(this.booking.checkIn);
    const checkOut = new Date(this.booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}