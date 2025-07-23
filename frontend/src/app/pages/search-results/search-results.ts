import { Component, OnInit } from '@angular/core';
import { Property } from '../../models/property.model';  
import propertiesData from '../../data/properties.json';
import { Navbar } from "../../components/navbar/navbar";

@Component({
  selector: 'app-search-results',
  imports: [Navbar],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css'
})
export class SearchResults implements OnInit {
  properties: Property[] = [];

  ngOnInit() {
    this.loadProperties();
  }

  private loadProperties() {
    this.properties = propertiesData as Property[];
  }
}
