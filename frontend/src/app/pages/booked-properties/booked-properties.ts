import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Property, Booking } from '../../models/property.model';
import { ApiService } from '../../services/api.service';

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
  selector: 'app-booked-properties',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule],
  templateUrl: './booked-properties.html',
  styleUrl: './booked-properties.css'
})
export class BookedPropertiesComponent implements OnInit {
  bookings: Booking[] = [];
  properties: Property[] = [];
  totalBookings: number = 0;
  totalRevenue: number = 0;
  occupancyRate: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Load bookings from API
    this.apiService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        
        // Calculate statistics
        this.totalBookings = this.bookings.length;
        this.totalRevenue = this.bookings.reduce((sum, booking) => sum + booking.price, 0);
        this.occupancyRate = 60; // Example value, could be calculated based on available dates
      },
      error: (error) => {
        console.error('Error fetching bookings:', error);
        // Fallback to local data if API fails
        import('../../data/bookings.json').then(data => {
          // Map bookings data to Booking model
          this.bookings = (data.default as BookingData[]).map(booking => ({
            id: booking.id,
            propertyId: booking.propertyId,
            propertyName: booking.propertyName,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            guests: booking.guests,
            bookingReference: booking.bookingRef,
            address: booking.address,
            city: booking.city,
            price: booking.price,
            image: booking.image
          }));
          
          // Calculate statistics
          this.totalBookings = this.bookings.length;
          this.totalRevenue = this.bookings.reduce((sum, booking) => sum + booking.price, 0);
          this.occupancyRate = 60; // Example value, could be calculated based on available dates
        });
      }
    });
    
    // Load properties from API
    this.apiService.getAllProperties().subscribe({
      next: (properties) => {
        this.properties = properties;
      },
      error: (error) => {
        console.error('Error fetching properties:', error);
        // Fallback to local data if API fails
        import('../../data/properties.json').then(data => {
          this.properties = data.default as Property[];
        });
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  getBookingStatus(index: number): string {
    // For demo purposes, alternate between confirmed and pending
    return index % 3 === 2 ? 'Pending' : 'Confirmed';
  }
}