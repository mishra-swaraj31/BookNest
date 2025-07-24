import { Component, OnInit } from '@angular/core';
import { Property, Room, Booking } from '../../models/property.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Navbar } from "../../components/navbar/navbar";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule, RouterModule],
  templateUrl: './property-details.html',
  styleUrl: './property-details.css',
})
export class PropertyDetailsComponent implements OnInit {
  property?: Property;
  sanitizedMapUrl?: SafeResourceUrl;
  serviceFee: number = 35;
  booking: Booking = {
    id: crypto.randomUUID(),
    propertyId: '',
    propertyName: '',
    checkIn: this.formatDate(new Date()),
    checkOut: this.formatDate(this.addDays(new Date(), 3)),
    guests: 2,
    bookingReference: '',
    address: '',
    city: '',
    price: 0,
    image: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/search']);
      return;
    }
    
    this.apiService.getProperty(id).subscribe({
      next: (property) => {
        this.property = property;
        
        if (this.property && this.property.mapEmbedUrl) {
          this.sanitizedMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.property.mapEmbedUrl);
          
          // Initialize booking with property details
          this.booking.propertyId = this.property.id;
          this.booking.propertyName = this.property.title;
          this.booking.address = this.property.location;
          this.booking.city = this.property.location.split(',')[0].trim();
          this.booking.price = this.property.price || 0;
          this.booking.image = this.property.image;
        }
      },
      error: (error) => {
        console.error('Error fetching property:', error);
        // Fallback to local data if API fails
        import('../../data/properties.json').then(data => {
          this.property = data.default.find(p => p.id === id);
          
          if (this.property && this.property.mapEmbedUrl) {
            this.sanitizedMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.property.mapEmbedUrl);
            
            // Initialize booking with property details
            this.booking.propertyId = this.property.id;
            this.booking.propertyName = this.property.title;
            this.booking.address = this.property.location;
            this.booking.city = this.property.location.split(',')[0].trim();
            this.booking.price = this.property.price || 0;
            this.booking.image = this.property.image;
          } else {
            // Handle property not found
            this.router.navigate(['/search']);
          }
        });
      }
    });
  }
  
  bookRoom(room: Room): void {
    if (this.property) {
      this.booking.price = room.price;
      this.bookProperty();
    }
  }
  
  bookProperty(): void {
    // Create the booking via API
    this.apiService.createBooking(this.booking).subscribe({
      next: (createdBooking) => {
        // Navigate to the confirmation page with the booking reference
        this.router.navigate(['/booking-confirm'], { 
          queryParams: { ref: createdBooking.bookingReference } 
        });
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        // Fallback to local approach if API fails
        this.booking.bookingReference = 'BK' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        this.router.navigate(['/booking-confirm'], { 
          queryParams: { ref: this.booking.bookingReference } 
        });
      }
    });
  }
  
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}