export interface Room {
  name: string;
  price: number;
  description: string;
  image: string;
  beds: number;
  baths: number;
}

export interface Review {
  name: string;
  date: string;
  text: string;
  rating?: number;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  bookingReference: string;
  address: string;
  city: string;
  price: number;
  image: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  profileImage: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  rating: number;
  reviewsCount: number;
  description: string;
  amenities: string[];
  rooms: Room[];
  reviews: Review[];
  image: string;
  mapEmbedUrl: string;
  price: number;
  beds: number;
  baths: number;
  freeCancellation: boolean;
}
